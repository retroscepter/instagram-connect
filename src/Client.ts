
import { EventEmitter } from 'events'

import { State } from './State'
import { Request } from './Request'
import { Realtime } from './Realtime'

/**
 * Main class for interacting with the Instagram private API.
 *
 * @extends {EventEmitter}
 */
export class Client extends EventEmitter {
    public state = new State(this)
    public request = new Request(this)
    public realtime = new Realtime(this)

    constructor () {
        super()
    }

    /**
     * Login and connect to Instagram.
     *
     * @public
     * 
     * @param username Instagram account username
     * @param password Instagram account password
     *
     * @returns {Promise<void>} Resolved after logging in and connecting
     */
    public async login (username?: string, password?: string): Promise<void> {

    }
}
