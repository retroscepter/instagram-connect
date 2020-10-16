
import crypto from 'crypto'

import { Manager } from './Manager'

/**
 * Manages account authentication.
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
    public async login (username: string, password: string): Promise<unknown> {
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
        // const { time, encrypted } = this.encryptPassword(password)

        const data = {
            username,
            password,
            // enc_password: `#PWD_INSTAGRAM:4:${time}:${encrypted}`,
            guid: this.client.state.uuid,
            phone_id: this.client.state.phoneId,
            device_id: this.client.state.deviceId,
            adid: '',
            google_tokens: '[]',
            login_attempt_count: 0,
            country_codes: JSON.stringify([{ country_code: '1', source: 'default' }]),
            jazoest
        }

        const response = await this.client.request.send({
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

    /**
     * Encrypt password.
     * 
     * @private
     *
     * @param password Password
     * 
     * @returns {{ time: string, encrypted: string }}
     */
    private encryptPassword (password: string): { time: string, encrypted: string } {
        const randomKey = crypto.randomBytes(32)
        const iv = crypto.randomBytes(16)
    
        const rsaEncrypted = crypto.publicEncrypt({
            // @ts-ignore
            key: Buffer.from(this.client.state.passwordEncryptionPublicKey, 'base64').toString(),
            padding: crypto.constants.RSA_PKCS1_PADDING
        }, randomKey)

        const cipher = crypto.createCipheriv('aes-256-gcm', randomKey, iv)
        const time = Math.floor(Date.now() / 1000).toString()

        cipher.setAAD(Buffer.from(time))

        const aesEncrypted = Buffer.concat([cipher.update(password, 'utf8'), cipher.final()])
        const sizeBuffer = Buffer.alloc(2, 0)
        sizeBuffer.writeInt16LE(rsaEncrypted.byteLength, 0)
        const authTag = cipher.getAuthTag()

        return {
            time,
            encrypted: Buffer.concat([
                Buffer.from([1, this.client.state.passwordEncryptionKeyId]),
                iv,
                sizeBuffer,
                rsaEncrypted,
                authTag,
                aesEncrypted
            ]).toString('base64')
        }
    }
}
