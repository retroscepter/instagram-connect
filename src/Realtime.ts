
import { Client } from './Client'

import { Mqtt } from './realtime/Mqtt'

/**
 * Interface for Mqtt connection.
 */
export class Realtime {
    public client: Client

    private mqtt = new Mqtt(this)

    /**
     * @param client Client managing the instance
     */
    constructor (client: Client) {
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
        await this.mqtt.connect()
    }
}
