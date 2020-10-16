
import { Manager } from './Manager'

import { LoginData } from '../responses/Account'

/**
 * Manages account authentication.
 * 
 * @extends {Manager}
 */
export class AccountManager extends Manager {
    /**
     * Send login request.
     * 
     * @public
     *
     * @param username Instagram account username
     * @param password Instagram account password
     * 
     * @returns {Promise<void>}
     */
    public async login (username: string, password: string): Promise<LoginData | undefined> {
        if (!this.client.state.deviceId) {
            this.client.state.generateDevice(username)
        }

        if (
            !this.client.state.passwordEncryptionKeyId ||
            !this.client.state.passwordEncryptionPublicKey
        ) {
            await this.client.qe.syncLoginExperiments()
        }

        const phoneId = this.client.state.phoneId
        const jazoest = phoneId ? this.createJazoest(phoneId) : undefined

        const data = {
            username,
            password,
            guid: this.client.state.uuid,
            phone_id: this.client.state.phoneId,
            device_id: this.client.state.deviceId,
            adid: '',
            google_tokens: '[]',
            login_attempt_count: 0,
            country_codes: JSON.stringify([{ country_code: '1', source: 'default' }]),
            jazoest
        }

        const response = await this.client.request.send<LoginData>({
            url: 'api/v1/accounts/login/',
            method: 'POST',
            data
        })

        return response.body
    }

    /**
     * Create Jazoest.
     *
     * @param input Input
     */
    private createJazoest (input: string): string {
        const buffer = Buffer.from(input, 'ascii')
        let sum = 0
        for (let i = 0; i < buffer.byteLength; i++) {
            sum += buffer.readUInt8(i)
        }
        return `2${sum}`
    }
}
