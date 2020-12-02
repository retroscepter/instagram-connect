
import { HTTPError } from 'got/dist/source'

/**
 * Instagram API error.
 * 
 * @extends {Error}
 */
export class APIError extends Error {
    /**
     * Error response body.
     * 
     * @type {any}
     */
    public body: any

    /**
     * @param error HTTP error
     */
    constructor (error: HTTPError) {
        super(`Status code ${error.response.statusCode}: ${JSON.stringify(error.response.body)}`)
        this.body = error.response.body
    }
}
