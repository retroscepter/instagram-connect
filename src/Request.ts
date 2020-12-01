
import got, { GotRequestFunction, Options, Response } from 'got'
import { createHmac } from 'crypto'

import { Client } from './Client'
import { APIError } from './errors/APIError'

import * as Constants from './constants'

export type RequestOptions = {
    url: string
    method?: 'GET' | 'POST'
    headers?: Headers
    data?: FormData
    qs?: FormData
    body?: Buffer
}

export type SignedFormBody = {
    ig_sig_key_version: string
    signed_body: string
}

export type FormData = Record<string, string | number | boolean | null | undefined>

export type Headers = Record<string, string | string[] | undefined>

/**
 * Manages requests and authorization for requests.
 */
export class Request {
    client: Client

    got: GotRequestFunction

    /**
     * @param client Client managing the instance
     */
    constructor (client: Client) {
        this.client = client

        this.got = got.extend({
            prefixUrl: Constants.API_URL,
            cookieJar: this.client.state.cookieJar,
            hooks: { afterResponse: [this.afterResponse.bind(this)] }
        })
    }

    /**
     * Send a request to the API.
     *
     * @param options Request options
     */
    public async send<T = unknown> (options: RequestOptions): Promise<Response<T>> {
        const body = options.body || undefined
        const headers = { ...this.headers, ...(options.headers || {}) }
        const data = body ? undefined : { ...this.data, ...(options.data || {}) }
        const searchParams = options.method === 'POST' ? options.qs : { ...data, ...(options.qs || {}) }
        const form = data && options.method === 'POST' ? this.signData(data) : undefined

        const requestOptions: Options = {
            url: options.url,
            method: options.method || 'GET',
            responseType: 'json',
            headers,
            searchParams,
            form,
            body
        }

        try {
            const response = await this.got(requestOptions)

            // @ts-expect-error Got doesn't type their responses.
            return response
        } catch (error) {
            /* Throw response body */

            if (!error.response) throw error

            /* Start challenge flow if a challenge is detected */

            if (error.response.body.message === 'challenge_required') {
                const url = error.response.body.challenge.api_path
                const challenge = this.client.state.challenge || await this.client.challenge.start(url)
                await new Promise(resolve => challenge.once('solved', resolve))
                return this.send(options)
            }

            throw new APIError(error)
        }
    }

    /**
     * Sign data.
     * 
     * @public
     *
     * @param data Data to sign
     */
    public sign (data: string): string {
        return createHmac('sha256', Constants.SIGNATURE_KEY).update(data).digest('hex')
    }

    /**
     * Sign form data.
     * 
     * @public
     *
     * @param data Form data to sign
     * 
     * @returns {SignedFormBody}
     */
    public signData (data: FormData): SignedFormBody {
        const string = JSON.stringify(data)
        const signature = this.sign(string)

        return {
            ig_sig_key_version: Constants.SIGNATURE_VERSION,
            signed_body: `${signature}.${string}`
        }
    }

    /**
     * After response hook for Got.
     *
     * @param response Got response
     * 
     * @returns {Response}
     */
    private afterResponse (response: Response): Response {
        this.updateStateFromResponse(response)
        this.client.emit('request', response)
        return response
    }

    /**
     * Update state from response data
     *
     * @param response Got response
     * 
     * @returns {void}
     */
    private updateStateFromResponse (response: Response): void {
        const {
            'x-ig-set-www-claim': igWWWClaim,
            'ig-set-authorization': authorization,
            'ig-set-password-encryption-key-id': passwordEncryptionKeyId,
            'ig-set-password-encryption-pub-key': passwordEncryptionPublicKey
        } = response.headers

        if (typeof igWWWClaim === 'string') this.client.state.igWWWClaim = igWWWClaim
        if (typeof authorization === 'string') this.client.state.authorization = authorization
        if (typeof passwordEncryptionKeyId === 'string') this.client.state.passwordEncryptionKeyId = passwordEncryptionKeyId
        if (typeof passwordEncryptionPublicKey === 'string') this.client.state.passwordEncryptionPublicKey = passwordEncryptionPublicKey
    }

    /**
     * Default form data for every request.
     * 
     * @private
     * 
     * @returns {FormData}
     */
    private get data (): FormData {
        return {
            _csrfToken: this.client.state.csrfToken,
            _uid: this.client.state.userId,
            _uuid: this.client.state.uuid,
            guid: this.client.state.uuid,
            device_id: this.client.state.deviceId,
            android_device_id: this.client.state.deviceId
        }
    }

    /**
     * Default headers for every request.
     * 
     * @private
     * 
     * @returns {Headers}
     */
    private get headers (): Headers {
        return {
            'X-Ads-Opt-Out': '1',
            'X-CM-Bandwidth-KBPS': '-1.000',
            'X-CM-Latency': '-1.000',
            'X-IG-Connection-Speed': '3700kbps',
            'X-IG-Bandwidth-Speed-KBPS': '-1.000',
            'X-IG-Bandwidth-TotalBytes-B': '0',
            'X-IG-Bandwidth-TotalTime-MS': '0',
            'X-IG-EU-DC-ENABLED': 'false',
            'X-IG-Extended-CDN-Thumbnail-Cache-Busting-Value': '1000',
            'X-IG-WWW-Claim': /* this.client.state.igWWWClaim || */ '0',
            'X-Bloks-Is-Layout-RTL': 'false',
            'X-FB-HTTP-Engine': 'Liger',
            'X-Pigeon-Rawclienttime': (Date.now() / 1000).toFixed(3),
            'X-Pigeon-Session-Id': this.client.state.pigeonSessionId,
            'X-IG-Connection-Type': Constants.HEADER_CONNECTION_TYPE,
            'X-IG-Capabilities': Constants.HEADER_CAPABILITIES,
            'X-IG-App-ID': Constants.FACEBOOK_ANALYTICS_APPLICATION_ID,
            'X-Bloks-Version-Id': Constants.BLOKS_VERSION_ID,
            'X-IG-App-Locale': Constants.LANGUAGE,
            'X-IG-Device-Locale': Constants.LANGUAGE,
            'X-IG-Device-ID': this.client.state.uuid,
            'X-IG-Android-ID': this.client.state.deviceId,
            'X-DEVICE-ID': this.client.state.uuid,
            'X-MID': this.client.state.getCookieValue('mid'),
            'Accept-Language': Constants.LANGUAGE.replace('_', '-'),
            'Accept-Encoding': 'gzip',
            'User-Agent': this.client.state.appUserAgent,
            Authorization: this.client.state.authorization,
            Host: Constants.API_HOST,
            Connection: 'close',
        }
    }
}
