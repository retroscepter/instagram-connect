
import { Client } from '../Client'

import { Entity } from './Entity'

import { ChallengeStateResponse } from '../responses/Challenge'

/**
 * Represents a challenge.
 *
 * @extends {Entity}
 */
export class Challenge extends Entity {
    url: string
    state?: ChallengeStateResponse

    /**
     * @param client Client managing this entity
     * @param url Challenge URL
     */
    constructor (client: Client, url: string) {
        super(client)
        this.url = `api/v1${url}`
    }

    /**
     * Hydrate state with challenge response.
     *
     * @public
     * 
     * @returns {Promise<ChallengeStateResponse>}
     */
    public async init (): Promise<ChallengeStateResponse> {
        const response = await this.client.request.send<ChallengeStateResponse>({
            url: this.url
        })

        this.updateState(response.body)
        return response.body
    }

    /**
     * Select verification method.
     * 
     * @public
     *
     * @param method Verification method
     * 
     * @returns {Promise<ChallengeStateResponse>}
     */
    public async selectMethod (method?: string): Promise<ChallengeStateResponse> {
        const data = {
            choice: method || this.state?.step_data.choice
        }

        const response = await this.client.request.send<ChallengeStateResponse>({
            url: this.url,
            method: 'POST',
            data
        })

        this.updateState(response.body)
        return response.body
    }

    /**
     * Solve challenge with security code.
     * 
     * @public
     *
     * @param code Security code
     * 
     * @returns {Promise<ChallengeStateResponse>}
     */
    public async solve (code: string | number): Promise<ChallengeStateResponse> {
        const data = {
            security_code: code
        }

        const response = await this.client.request.send<ChallengeStateResponse>({
            url: this.url,
            method: 'POST',
            data
        })

        this.updateState(response.body)
        return response.body
    }

    /**
     * Reset challenge.
     * 
     * @public
     * 
     * @returns {Promise<ChallengeStateResponse>}
     */
    public async reset (): Promise<ChallengeStateResponse> {
        const response = await this.client.request.send<ChallengeStateResponse>({
            url: this.url.replace('/challenge/', '/challenge/reset/'),
            method: 'POST'
        })

        this.updateState(response.body)
        return response.body
    }

    /**
     * Close challenge.
     * 
     * @public
     * 
     * @returns {void}
     */
    public close (): void {
        this.state = undefined
        this.client.challenge.close()
        this.emit('solved')
    }

    /**
     * Update state from challenge state response
     *
     * @param body Challenge state response
     * 
     * @returns {void}
     */
    private updateState (body: ChallengeStateResponse): void {
        if (body.action === 'close') {
            this.close()
        } else {
            this.state = body
        }
    }
}
