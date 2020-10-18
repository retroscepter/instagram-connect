
import { Client } from '../Client'

import { Entity } from './Entity'

import { LoggedInUserData } from '../managers/AccountManager'

export type ChallengeStateData = {
    step_name: string
    step_data: ChallengeStepData
    logged_in_user?: LoggedInUserData
    user_id: number
    nonce_code: string
    action: string
    status: string
}

export type ChallengeStepData = {
    choice: string
    fb_access_token: string
    big_blue_token: string
    google_oauth_token: string
    email: string
    security_code: string
    resend_delay: number
    contact_point: string
    form_type: string
}


/**
 * Represents a challenge.
 *
 * @extends {Entity}
 */
export class Challenge extends Entity {
    url: string
    state?: ChallengeStateData

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
     * @returns {Promise<ChallengeStateData>}
     */
    public async init (): Promise<ChallengeStateData> {
        const response = await this.client.request.send<ChallengeStateData>({
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
     * @returns {Promise<ChallengeStateData>}
     */
    public async selectMethod (method?: string): Promise<ChallengeStateData> {
        const data = {
            choice: method || this.state?.step_data.choice
        }

        const response = await this.client.request.send<ChallengeStateData>({
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
     * @returns {Promise<ChallengeStateData>}
     */
    public async solve (code: string | number): Promise<ChallengeStateData> {
        const data = {
            security_code: code
        }

        const response = await this.client.request.send<ChallengeStateData>({
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
     * @returns {Promise<ChallengeStateData>}
     */
    public async reset (): Promise<ChallengeStateData> {
        const response = await this.client.request.send<ChallengeStateData>({
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
    private updateState (body: ChallengeStateData): void {
        if (body.action === 'close') {
            this.close()
        } else {
            this.state = body
        }
    }
}
