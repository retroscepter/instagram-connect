
import { Client } from '../Client'

import { MqttotClient } from './MqttotClient'
import { Commands } from './Commands'

import * as Constants from '../constants'
import * as Topics from '../constants/topics'

import { Parser } from './parsers/Parser'
import { RegionHintParser } from './parsers/RegionHintParser'
import { SkywalkerParser } from './parsers/SkywalkerParser'
import { GraphQLParser } from './parsers/GraphQLParser'
import { IrisParser } from './parsers/IrisParser'

import { Handler } from './handlers/Handler'
import { RegionHintHandler } from './handlers/RegionHintHandler'
import { SkywalkerHandler } from './handlers/SkywalkerHandler'
import { GraphQLHandler } from './handlers/GraphQLHandler'
import { IrisHandler } from './handlers/IrisHandler'

/**
 * Interface for Mqttot connect to Realtime broker.
 */
export class Realtime extends MqttotClient {
    public client: Client

    public commands = new Commands(this)

    private parsers: Record<string, Parser> = {
        [Topics.REGION_HINT_ID]: new RegionHintParser(),
        [Topics.REALTIME_SUB_ID]: new GraphQLParser(),
        [Topics.MESSAGE_SYNC_ID]: new IrisParser(),
        [Topics.PUBSUB_ID]: new SkywalkerParser()
    }

    private handlers: Record<string, Handler> = {
        [Topics.REGION_HINT_ID]: new RegionHintHandler(this),
        [Topics.REALTIME_SUB_ID]: new GraphQLHandler(this),
        [Topics.MESSAGE_SYNC_ID]: new IrisHandler(this),
        [Topics.PUBSUB_ID]: new SkywalkerHandler(this)
    }

    /**
     * @param client Client managing the instance
     */
    constructor (client: Client) {
        super({ url: Constants.REALTIME_URL, autoReconnect: true })
        this.client = client
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
        this.$message.subscribe(this.onMessage.bind(this))
        this.$error.subscribe(this.onError.bind(this))
        this.$disconnect.subscribe(this.onDisconnect.bind(this))

        await super.connect()
    }

    /**
     * Handle connect.
     * 
     * @private
     * 
     * @returns {Promise<void>}
     */
    private async onConnect (): Promise<void> {
        await this.commands.irisSubscribe({
            sequenceId: this.client.state.irisSequenceId || 1,
            snapshotTimestamp: this.client.state.irisSnapshotTimestamp || 1
        })

        await this.client.direct.getInbox()

        await this.commands.skywalkerSubscribe([
            `ig/u/v1/${this.client.state.userId}`,
            `ig/live_notification_subscribe/${this.client.state.userId}`,
        ])

        await this.commands.graphQlSubscribe([
            `1/graphqlsubscriptions/17846944882223835/${JSON.stringify({ input_data: { user_id: this.client.state.userId } })}`,
            `1/graphqlsubscriptions/17867973967082385/${JSON.stringify({ input_data: { user_id: this.client.state.userId } })}`
        ])

        this.client.emit('ready')
    }

    /**
     * Handle disconnect.
     * 
     * @private
     * 
     * @returns {Promise<void>}
     */
    private async onDisconnect (): Promise<void> {
        
    }

    /**
     * Handle error.
     * 
     * @private
     * 
     * @param error Error
     * 
     * @returns {Promise<void>}
     */
    private async onError (error: Error): Promise<void> {
        
    }

    /**
     * Handle incoming message.
     * 
     * @private
     * 
     * @param message Incoming message
     * 
     * @returns {Promise<void>}
     */
    private async onMessage (message: any): Promise<void> {
        for (const p in this.parsers) {
            if (p === message.topic) {
                const parsed = await this.parsers[p].parse(message.payload)
                await this.handlers[p].handle(parsed)
            }
        }
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
                    Topics.MESSAGE_SYNC_ID,
                    Topics.REGION_HINT_ID,
                    Topics.GRAPHQL_ID
                ].map(t => parseInt(t)),
                clientMqttSessionId: mqttSessionId,
                clientCapabilities: Constants.REALTIME_CAPABILITIES,
                endpointCapabilities: Constants.ENDPOINT_CAPABILITIES,
                networkType: Constants.NETWORK_TYPE,
                networkSubtype: Constants.NETWORK_SUBTYPE,
                publishFormat: Constants.PUBLISH_FORMAT,
                clientType: Constants.CLIENT_TYPE,
                appId: BigInt(Constants.FACEBOOK_ANALYTICS_APPLICATION_ID),
                clientStack: Constants.CLIENT_STACK,
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
}
