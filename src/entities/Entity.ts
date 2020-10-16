
import { EventEmitter } from 'events'

import { Client } from '../Client'

/**
 * Base class for entities.
 * 
 * @extends {EventEmitter}
 */
export class Entity extends EventEmitter {
    client: Client

    /**
     * @param client Client managing this entity
     */
    constructor (client: Client) {
        super()
        this.client = client
    }
}
