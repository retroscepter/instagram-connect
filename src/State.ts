
import { Chance } from 'chance'
import { Cookie, CookieJar, MemoryCookieStore } from 'tough-cookie'

import { Client } from './Client'

import { DeviceInfo } from './types/DeviceInfo'

import * as Constants from './constants'
import { BUILDS } from './constants/builds'
import { DEVICES } from './constants/devices'

/**
 * Manages authentication and session state.
 */
export class State {
    public client: Client

    public cookieStore = new MemoryCookieStore()
    public cookieJar = new CookieJar(this.cookieStore, { allowSpecialUseDomain: true })

    public authorization?: string
    public deviceId?: string
    public deviceName?: string
    public appBuild?: string
    public phoneId?: string
    public uuid?: string
    public adid?: string

    /**
     * @param client Client managing the instance
     */
    constructor (client: Client) {
        this.client = client
    }

    /**
     * Client session ID.
     * 
     * @public
     *
     * @returns {string}
     */
    public get clientSessionId (): string {
        return this.generateGuid('clientSessionId', Constants.CLIENT_SESSION_ID_LIFETIME)
    }

    /**
     * Pigeon session ID.
     * 
     * @public
     * 
     * @returns {string}
     */
    public get pigeonSessionId (): string {
        return this.generateGuid('pigeonSessionId', Constants.PIGEON_SESSION_ID_LIFETIME)
    }

    /**
     * User Agent string.
     * 
     * @public
     * 
     * @returns {string}
     */
    public get appUserAgent (): string {
        return `Instagram ${Constants.APP_VERSION} Android (${this.deviceName}; ${Constants.LANGUAGE}; ${Constants.APP_VERSION_CODE})`
    }

    /**
     * CSRF token.
     * 
     * @public
     * 
     * @returns {string | undefined}
     */
    public get csrfToken (): string | undefined {
        return this.getCookieValue('csrftoken')
    }

    /**
     * User ID.
     * 
     * @public
     * 
     * @returns {string | undefined}
     */
    public get userId (): string | undefined {
        return this.getCookieValue('ds_user_id')
    }

    /**
     * Username.
     * 
     * @public
     * 
     * @returns {string | undefined}
     */
    public get username (): string | undefined {
        return this.getCookieValue('ds_user')
    }

    /**
     * Device information.
     * 
     * @public
     * 
     * @return {DeviceInfo | null}
     */
    public get deviceInfo (): DeviceInfo | null {
        if (!this.deviceName) return null

        const deviceSplit = this.deviceName?.split(';')
        const [androidVersion, androidRelease] = deviceSplit[0].split('/')
        const [manufacturer] = deviceSplit[3].split('/')
        const model = deviceSplit[4]

        return {
            androidVersion,
            androidRelease,
            manufacturer,
            model
        }
    }

    /**
     * Get all cookies.
     * 
     * @public
     * 
     * @returns {Cookie[]}
     */
    public getCookies (): Cookie[] {
        return this.cookieJar.getCookiesSync(Constants.API_HOST)
    }

    /**
     * Get cookie by key. 
     * 
     * @public
     *
     * @param key Cookie key
     */
    public getCookie (key: string): Cookie | undefined {
        return this.getCookies().find(cookie => cookie.key === key)
    }
    
    /**
     * Get cookie value by key.
     * 
     * @public
     *
     * @param key Cookie key
     */
    public getCookieValue (key: string): string | undefined {
        return this.getCookie(key)?.value
    }

    /**
     * Generate device IDs.
     *
     * @public
     * 
     * @param seed Seed for random generation
     */
    public generateDevice (seed: string): void {
        const chance = new Chance(seed)
        this.deviceId = `android-${chance.string({ pool: 'abcdef0123456789', length: 16 })}`
        this.deviceName = chance.pickone(DEVICES)
        this.appBuild = chance.pickone(BUILDS)
        this.phoneId = chance.guid()
        this.uuid = chance.guid()
        this.adid = chance.guid()
    }

    /**
     * Generate a temporary guid.
     *
     * @public
     * 
     * @param seed Seed for randomization
     * @param lifetime Lifetime of the guid
     */
    public generateGuid (seed: string, lifetime: number): string {
        return new Chance(`${seed}${this.deviceId}${Math.round(Date.now() / lifetime)}`).guid()
    }
}
