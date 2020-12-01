
import { HTTPError } from 'got/dist/source'

/**
 * Instagram API error.
 * 
 * @extends {Error}
 */
export class APIError extends Error {
    public body: any
    public httpError: HTTPError

    /**
     * @param error HTTP error
     */
    constructor (error: HTTPError) {
        super(`Status code ${error.response.statusCode}: ${JSON.stringify(error.response.body)}`)
        Object.assign(this, error.response.body)
        this.httpError = error
    }
}
