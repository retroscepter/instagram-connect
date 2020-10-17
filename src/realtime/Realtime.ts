
import { Client } from '../Client'

import { MqttotClient } from './MqttotClient'

import * as Constants from '../constants'
import * as RealtimeConstants from '../constants/realtime'
import * as Topics from '../constants/topics'

/**
 * Interface for Mqttot connect to Realtime broker.
 */
export class Realtime extends MqttotClient {
    public client: Client

    /**
     * @param client Client managing the instance
     */
    constructor (client: Client) {
        super({ url: RealtimeConstants.REALTIME_URL, autoReconnect: true })
        this.client = client
    }

    /**
     * Connect request payload data.
     * 
     * @public
     * 
     * @returns {Record<string, unknown>}
     */
    public get connectPayloadData (): Record<string, unknown> {
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
                subscribeTopics: [
                    Topics.PUBSUB_ID,
                    Topics.REALTIME_SUB_ID,
                    Topics.SEND_MESSAGE_RESPONSE_ID,
                    Topics.IRIS_SUB_RESPONSE_ID,
                    Topics.MESSAGE_SYNC_ID
                ],
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
            appSpecificInfo: {
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
    }

    /**
     * Connect to Instagram Realtime and FBNS.
     *
     * @public
     *
     * @returns {Promise<void>} Resolved after connecting
     */
    public async connect (): Promise<void> {
        await super.connect()
    }
}
