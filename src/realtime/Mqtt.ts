
import { MqttClient, PacketFlowFunc, ConnectResponsePacket, isConnAck } from 'mqtts'

import { Client } from '../Client'
import { Realtime } from '../Realtime'

import { ConnectPacket } from './ConnectPacket'

import * as Constants from '../constants'
import * as MqttConstants from '../constants/mqtt'
import * as Topics from '../constants/topics'

/**
 * Manages Mqtt connection to Realtime broker and FBNS.
 */
export class Mqtt extends MqttClient {
    realtime: Realtime

    connectPayload?: Buffer
    requirePayload: boolean = false

    /**
     * @param realtime Realtime manager manging this instance
     */
    constructor (realtime: Realtime) {
        super({ url: MqttConstants.REALTIME_URL, autoReconnect: true })
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
        if (!this.client.state.deviceId) throw new Error('device id is not defined')

        const userId = parseInt(this.client.state.userId)
        const sessionId = process.uptime() * 1000
        const userAgent = this.client.state.appUserAgent
        const deviceId = this.client.state.deviceId

        return {
            u: userId,
            a: userAgent,
            cp: MqttConstants.CAPABILITIES,
            mqtt_sid: sessionId,
            nwt: MqttConstants.NETWORK_TYPE,
            nwst: MqttConstants.NETWORK_SUBTYPE,
            chat_on: false,
            no_auto_fg: true,
            d: deviceId,
            ds: '',
            fg: false,
            ecp: MqttConstants.ENDPOINT_CAPABILITIES,
            pf: MqttConstants.PUBLISH_FORMAT,
            ct: MqttConstants.CLIENT_TYPE,
            aid: Constants.FACEBOOK_ANALYTICS_APPLICATION_ID,
            st: this.mqttDefaultTopics,
            clientStack: MqttConstants.CLIENT_STACK,
            app_specific_info: this.mqttAppSpecificInfo
        }
    }

    /**
     * Mqtt connection password.
     * 
     * @private
     * 
     * @returns {string | undefined}
     */
    private get mqttPassword (): string | undefined {
        return this.client.state.sessionId
    }

    /**
     * Mqtt connection client ID.
     * 
     * @private
     * 
     * @returns {string | undefined}
     */
    private get mqttClientId (): string | undefined {
        return this.client.state.deviceId
    }

    /**
     * Mqtt connection default subscription topics.
     * 
     * @private
     * 
     * @returns {string[]}
     */
    private get mqttDefaultTopics (): string[] {
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
     * Connect to Mqtt broker.
     *
     * @public
     * 
     * @returns {Promise<void>}
     */
    public async init (): Promise<void> {
        this.$connect.subscribe(console.log)
        this.$disconnect.subscribe(console.log)
        this.$warning.subscribe(console.warn)
        this.$error.subscribe(console.error)
        this.$message.subscribe(console.log)
        await this.connect()
    }

    /**
     * Get connection flow wrapper for Mqtt client.
     * 
     * @protected
     * 
     * @returns {PacketFlowFunc<unknown>}
     */
    protected getConnectFlow (): PacketFlowFunc<unknown> {
        return success => ({
            start: this.onConnectFlowStart,
            accept: this.onConnectFlowAccept,
            next: this.onConnectFlowNext(success)
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
        if (this.connectPayload) {
            return new ConnectPacket(this.connectPayload)
        } else {
            throw new Error('connect payload is missing')
        }
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
     * 
     * @returns {(packet: ConnectResponsePacket) => void}
     */
    private onConnectFlowNext (success: unknown): (packet: ConnectResponsePacket) => void {
        return (packet: ConnectResponsePacket) => {
            if (packet.isSuccess) {
                if (packet.payload?.length || !this.requirePayload) {
                    // @ts-expect-error Function isn't typed
                    success(packet)
                } else {
                    throw new Error('CONNACK: no payload')
                }
            } else {
                throw new Error('CONNACK: connection error')
            }
        }
    }
}
