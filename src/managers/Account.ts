
import crypto from 'crypto'

import { Manager } from './Manager'

/**
 * Manages account authentication.
 */
export class AccountManager extends Manager {
    /**
     * Send login request.
     *
     * @param username Instagram account username
     * @param password Instagram account password
     */
    public async login (username: string, password: string): Promise<void> {

    }

    /**
     * Encrypt password.
     *
     * @param password Password
     */
    public encryptPassword (password: string): { time: string, encrypted: string } {
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
