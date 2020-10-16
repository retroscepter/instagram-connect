
import { EventEmitter } from 'events'

import { State } from './State'
import { Request } from './Request'
import { Realtime } from './Realtime'

import { QEManager } from './managers/QE'
import { AccountManager } from './managers/Account'

/**
 * Main class for interacting with the Instagram private API.
 *
 * @extends {EventEmitter}
 */
export class Client extends EventEmitter {
    public state = new State(this)
    public request = new Request(this)
    public realtime = new Realtime(this)

    public qe = new QEManager(this)
    public account = new AccountManager(this)

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
        if (typeof username !== 'string') throw new TypeError('username is required and must be a string')
        if (typeof password !== 'string') throw new TypeError('password is required and must be a string')

        await this.account.login(username, password)
    }
}
