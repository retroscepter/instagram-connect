
import { MqttotClient } from './MqttotClient'

import * as Topics from '../constants/topics'

/**
 * Mqttot command manager.
 */
export class Commands {
    client: MqttotClient

    /**
     * @param client Mqttot client managing this manager
     */
    constructor (client: MqttotClient) {
        this.client = client
    }

    /**
     * Subscribe to topics.
     * 
     * @public
     *
     * @param topic Topic to send subscriptions to
     * @param topics Topics to subscribe to
     * 
     * @returns {Promise<void>}
     */
    public async subscribe (topic: string, topics: string[]): Promise<void> {
        await this.client.publishData(topic, { sub: topics })
    }

    public async graphQlSubscribe (topics: string[]): Promise<void> {
        await this.subscribe(Topics.REALTIME_SUB_ID, topics)
    }

    public async skywalkerSubscribe (topics: string[]): Promise<void> {
        await this.subscribe(Topics.PUBSUB_ID, topics)
    }

    /**
     * Subscribe to iris.
     *
     * @public
     *
     * @param options Subscription options
     * @param options.sequence Iris sequence ID.
     * @param options.snapshot Iris snapshot timestamp in ms.
     */
    public async irisSubscribe (options: { sequence: number, snapshot: number }): Promise<void> {
        await this.client.publishData(Topics.IRIS_SUB_ID, {
            seq_id: options.sequence,
            snapshot_at_ms: options.snapshot
        })
    }
}
