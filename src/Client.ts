
import { EventEmitter } from 'events'
import TypedEmitter from 'typed-emitter'

import { State } from './State'
import { Request } from './Request'
import { Realtime } from './realtime/Realtime'

import { QEManager } from './managers/QE'
import { AccountManager } from './managers/Account'
import { ChallengeManager } from './managers/Challenge'
import { DirectManager } from './managers/Direct'

import { ClientEvents } from './types/ClientEvents'
import { ClientOptions } from './types/ClientOptions'

/**
 * Main class for interacting with the Instagram private API.
 *
 * @extends {EventEmitter}
 */
export class Client extends (EventEmitter as new () => TypedEmitter<ClientEvents>) {
    public state = new State(this)
    public request = new Request(this)
    public realtime = new Realtime(this)

    public qe = new QEManager(this)
    public account = new AccountManager(this)
    public challenge = new ChallengeManager(this)
    public direct = new DirectManager(this)

    public options: ClientOptions

    /**
     * @param options Client options
     */
    constructor (options: ClientOptions) {
        super()

        if (typeof options.username !== 'string') throw new TypeError('username is required and must be a string')
        if (typeof options.password !== 'string') throw new TypeError('password is required and must be a string')
        if (options.state && typeof options.state === 'string') options.state = JSON.parse(options.state)

        this.options = options
    }

    /**
     * Login and connect to Instagram.
     *
     * @public
     *
     * @returns {Promise<void>} Resolved after logging in and connecting
     */
    public async login (): Promise<void> {
        const state = this.options.state
        const username = this.options.username
        const password = this.options.password

        if (state) {
            await this.state.import(state)
            await this.qe.syncExperiments()
        } else {
            await this.account.login(username, password)
        }

        await this.realtime.connect()

        this.emit('ready')
    }
}
