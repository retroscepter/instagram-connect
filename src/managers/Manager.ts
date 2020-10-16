
import { Client } from '../Client'

/**
 * Base class for managers.
 */
export class Manager {
    client: Client

    /**
     * @param client Client managing this instance
     */
    constructor (client: Client) {
        this.client = client
    }
}
