
import qs from 'qs'
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import axiosCookieJarSupport from 'axios-cookiejar-support'
import hmacSHA256 from 'crypto-js/hmac-sha256'
import encHex from 'crypto-js/enc-hex'

import { Client } from './Client'

import { RequestSendOptions } from './types/RequestSendOptions'
import { SignedFormBody } from './types/SignedFormBody'

import * as Constants from './constants'

/**
 * Manages requests and authorization for requests.
 */
export class Request {
    client: Client

    axios: AxiosInstance

    /**
     * @param client Client managing the instance
     */
    constructor (client: Client) {
        this.client = client

        this.axios = axios.create({
            baseURL: `${Constants.API_URL}`,
            // jar: this.client.state.cookieJar
        })

        // axiosCookieJarSupport(this.axios)
    }

    /**
     * Send a request to the API.
     *
     * @param options Request options
     */
    public async send (options: RequestSendOptions) {
        const headers = { ...this.headers, ...(options.headers || {}) }
        const data = options.data ? qs.stringify(this.signData(options.data)) : undefined

        const requestOptions: AxiosRequestConfig = {
            url: options.url,
            method: options.method || 'GET',
            headers,
            data
        }

        console.log(requestOptions)

        const response = await this.axios(requestOptions)
        return response.data
    }

    /**
     * Sign data.
     * 
     * @public
     *
     * @param data Data to sign
     */
    public sign (data: string): string {
        const signature = hmacSHA256(data, Constants.SIGNATURE_KEY)
        return encHex.stringify(signature)
    }

    /**
     * Sign form data.
     * 
     * @public
     *
     * @param data Form data to sign
     */
    public signData (data: Record<string, string | undefined>): SignedFormBody {
        const string = JSON.stringify(data)
        const signature = this.sign(string)

        return {
            ig_sig_key_version: Constants.SIGNATURE_VERSION,
            signed_body: `${signature}.${string}`
        }
    }

    /**
     * Default headers for every request.
     * 
     * @private
     * 
     * @returns {Record<string, string>}
     */
    private get headers (): Record<string, string | null | undefined> {
        return {
            'X-Ads-Opt-Out': '1',
            'X-CM-Bandwidth-KBPS': '-1.000',
            'X-CM-Latency': '-1.000',
            'X-IG-Connection-Speed': `3700kbps`,
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
            'X-MID': this.client.state.getCookieValue('mid') || null,
            'Accept-Language': Constants.LANGUAGE.replace('_', '-'),
            'Accept-Encoding': 'gzip',
            'User-Agent': this.client.state.appUserAgent,
            Authorization: this.client.state.authorization || null,
            Host: Constants.API_HOST,
            Connection: 'close',
        }
    }
}
