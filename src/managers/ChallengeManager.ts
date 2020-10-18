
import { Manager } from './Manager'

import { Challenge } from '../entities/Challenge'

/**
 * Manages challenges.
 *
 * @extends {Manager}
 */
export class ChallengeManager extends Manager {
    /**
     * Start challenge flow.
     *
     * @param url Challenge URL
     * 
     * @returns {Promise<Challenge>}
     */
    public async start (url: string): Promise<Challenge> {
        this.client.state.challenge = new Challenge(this.client, url)
        await this.client.state.challenge.init()
        this.client.emit('challenge', this.client.state.challenge)
        return this.client.state.challenge
    }

    /**
     * Close challenge.
     * 
     * @public
     * 
     * @returns {Promise<void>}
     */
    public close (): void {
        this.client.state.challenge = undefined
    }
}
