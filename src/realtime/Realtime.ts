
import { Client } from '../Client'

import { MqttotClient } from './MqttotClient'
import { Commands } from './Commands'

import * as Constants from '../constants'
import * as RealtimeConstants from '../constants/realtime'
import * as Topics from '../constants/topics'
import { unzip } from './util'
import { thriftRead, thriftReadToObject } from './thrift'

/**
 * Interface for Mqttot connect to Realtime broker.
 */
export class Realtime extends MqttotClient {
    public client: Client

    public commands = new Commands(this)

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
                ].map(t => parseInt(t)),
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
        this.$connect.subscribe(this.onConnect.bind(this))
        this.$disconnect.subscribe(this.onDisconnect.bind(this))
        this.$error.subscribe(this.onError.bind(this))

        this.listen({ topic: Topics.REALTIME_SUB_ID }).subscribe(this.onRealtimeMessage.bind(this))
        this.listen({ topic: Topics.MESSAGE_SYNC_ID }).subscribe(this.onMessageSync.bind(this))

        await super.connect()
    }

    private async onConnect (): Promise<void> {
        if (
            !this.client.direct.sequenceId ||
            !this.client.direct.snapshotTimestamp
        ) {
            await this.client.direct.getInbox()
        }

        await this.commands.irisSubscribe({
            sequenceId: this.client.direct.sequenceId || 1,
            snapshotTimestamp: this.client.direct.snapshotTimestamp || 1
        })

        await this.commands.skywalkerSubscribe([
            `ig/u/v1/${this.client.state.userId}`,
            `ig/live_notification_subscribe/${this.client.state.userId}`,
        ])

        await this.commands.graphQlSubscribe([
            `1/graphqlsubscriptions/17846944882223835/${JSON.stringify({ input_data: { user_id: this.client.state.userId } })}`,
            `1/graphqlsubscriptions/17867973967082385/${JSON.stringify({ input_data: { user_id: this.client.state.userId } })}`
        ])
    }

    private async onDisconnect (): Promise<void> {
        
    }

    private async onError (): Promise<void> {
        
    }

    private async onRealtimeMessage (message: any): Promise<void> {
        const unzipped = await unzip(message.payload)
        const thriftMessage = thriftRead(unzipped)
        const eventName = thriftMessage[0].value
        const eventData = JSON.parse(thriftMessage[1].value)
        // console.log(eventName, eventData)
    }

    private async onMessageSync (message: any): Promise<void> {
        const unzipped = await unzip(message.payload)
        const json = unzipped.toString('utf8')
        const data = JSON.parse(json)
        // console.log(data)
    }
}
