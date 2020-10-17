
import { MqttClient, PacketFlowFunc, ConnectResponsePacket, isConnAck } from 'mqtts'

import { Client } from '../Client'
import { Realtime } from '../Realtime'

import { ConnectPacket, thriftPacketConfig } from './ConnectPacket'
import { thriftWriteFromObject } from './thrift'

import * as Constants from '../constants'
import * as RealtimeConstants from '../constants/realtime'
import * as Topics from '../constants/topics'
import { compressDeflate } from './util'

/**
 * Wrapper around Mqtt for custom thrift payloads.
 */
export class Mqtt extends MqttClient {
    realtime: Realtime

    connectPayload?: Buffer
    requirePayload: boolean = false

    /**
     * @param realtime Realtime manager managing this instance
     */
    constructor (realtime: Realtime) {
        super({ url: RealtimeConstants.REALTIME_URL, autoReconnect: true })
        this.state.connectOptions = { keepAlive: 60 }
        this.realtime = realtime
    }

    /**
     * Realtime manager's client.
     * 
     * @public
     * 
     * @returns {Client}
     */
    public get client (): Client {
        return this.realtime.client
    }

    /**
     * Mqtt connection data.
     * 
     * @private
     * 
     * @returns {Record<string, unknown>}
     */
    private get mqttConnectionData (): Record<string, unknown> {
        if (!this.client.state.userId) throw new Error('user id is not defined')
        if (!this.client.state.sessionId) throw new Error('session id is not defined')
        if (!this.client.state.phoneId) throw new Error('device id is not defined')

        const userId = BigInt(this.client.state.userId)
        const sessionId = this.client.state.sessionId
        const mqttSessionId = BigInt(Date.now()) & BigInt(0xffffffff)
        const userAgent = this.client.state.appUserAgent
        const deviceId = this.client.state.phoneId
        const password = `sessionid=${sessionId}`

        return {
            clientIdentifier: deviceId.substring(0, 20),
            password,
            clientInfo: {
                userId,
                userAgent,
                deviceId,
                deviceSecret: '',
                subscribeTopics: this.mqttDefaultTopics,
                clientMqttSessionId: mqttSessionId,
                clientCapabilities: RealtimeConstants.CAPABILITIES,
                endpointCapabilities: RealtimeConstants.ENDPOINT_CAPABILITIES,
                networkType: RealtimeConstants.NETWORK_TYPE,
                networkSubtype: RealtimeConstants.NETWORK_SUBTYPE,
                publishFormat: RealtimeConstants.PUBLISH_FORMAT,
                clientType: RealtimeConstants.CLIENT_TYPE,
                appId: BigInt(Constants.FACEBOOK_ANALYTICS_APPLICATION_ID),
                clientStack: RealtimeConstants.CLIENT_STACK,
                noAutomaticForeground: true,
                isInitiallyForeground: false
            },
            appSpecificInfo: this.mqttAppSpecificInfo
        }
    }

    /**
     * Mqtt connection default subscription topics.
     * 
     * @private
     * 
     * @returns {number[]}
     */
    private get mqttDefaultTopics (): number[] {
        return [
            Topics.PUBSUB_ID,
            Topics.REALTIME_SUB_ID,
            Topics.SEND_MESSAGE_RESPONSE_ID,
            Topics.IRIS_SUB_RESPONSE_ID,
            Topics.MESSAGE_SYNC_ID
        ]
    }

    /**
     * Mqtt connection app-specific info.
     * 
     * @private
     * 
     * @returns {Record<string, unknown>}
     */
    private get mqttAppSpecificInfo (): Record<string, unknown> {
        return {
            app_version: Constants.APP_VERSION,
            'X-IG-Capabilities': Constants.HEADER_CAPABILITIES,
            everclear_subscriptions: JSON.stringify({
                inapp_notification_subscribe_comment: '17899377895239777',
                inapp_notification_subscribe_comment_mention_and_reply: '17899377895239777',
                video_call_participant_state_delivery: '17977239895057311',
                presence_subscribe: '17846944882223835'
            }),
            'User-Agent': this.client.state.appUserAgent,
            'Accept-Language': Constants.LANGUAGE.replace('_', '-'),
            platform: 'android',
            ig_mqtt_route: 'django',
            pubsub_msg_type_blacklist: 'direct, typing_type',
            auth_cache_enabled: '0'
        }
    }

    /**
     * Create initial connection payload.
     * 
     * @private
     * 
     * @returns {Promise<void>}
     */
    private async createConnectPayload (): Promise<void> {
        this.connectPayload = await compressDeflate(thriftWriteFromObject(this.mqttConnectionData, thriftPacketConfig))
    }

    /**
     * Connect to Mqtt broker.
     *
     * @public
     * 
     * @returns {Promise<void>}
     */
    public async connect (): Promise<void> {
        await this.createConnectPayload()
        await super.connect()
    }

    /**
     * Get connection flow wrapper for Mqtt client.
     * 
     * @protected
     * 
     * @returns {PacketFlowFunc<unknown>}
     */
    protected getConnectFlow (): PacketFlowFunc<unknown> {
        return (success, error) => ({
            start: this.onConnectFlowStart.bind(this),
            accept: this.onConnectFlowAccept.bind(this),
            next: this.onConnectFlowNext(success, error).bind(this)
        })
    }

    /**
     * Connect flow start handler.
     *  
     * @private
     * 
     * @returns {ConnectPacket}
     */
    private onConnectFlowStart (): ConnectPacket {
        const packet = new ConnectPacket(this.connectPayload)
        return packet
    }

    /**
     * Connect flow attempt handler.
     * 
     * @private
     * 
     * @returns {typeof isConnAck}
     */
    private get onConnectFlowAccept (): typeof isConnAck {
        return isConnAck
    }

    /**
     * Connect flow next handler.
     * 
     * @private
     *
     * @param success Success callback
     * @param error Error callback
     * 
     * @returns {(packet: ConnectResponsePacket) => void}
     */
    private onConnectFlowNext (success: unknown, error: unknown): (packet: ConnectResponsePacket) => void {
        return (packet: ConnectResponsePacket) => {
            if (packet.isSuccess) {
                if (packet.payload?.length || !this.requirePayload) {
                    // @ts-expect-error Function isn't typed
                    success(packet)
                } else {
                    // @ts-expect-error Function isn't typed
                    error(new Error('CONNACK: no payload'))
                }
            } else {
                // @ts-expect-error Function isn't typed
                error(new Error('CONNACK: connection error'))
            }
        }
    }
}
