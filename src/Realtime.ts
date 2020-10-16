
import { Client } from './Client'

/**
 * Manages connection to Realtime and FBNS.
 */
export class Realtime {
    public client: Client

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
        
    }
}
