
import { Realtime } from '../Realtime'

/**
 * Message handler.
 */
export class Handler {
    realtime: Realtime

    /**
     * @param realtime Realtime client managing this parser
     */
    constructor (realtime: Realtime) {
        this.realtime = realtime
    }

    /**
     * Handle a message.
     *
     * @public
     *
     * @param data Message data
     *
     * @returns {Promise<T>}
     */
    public async handle (data: Buffer): Promise<void> {
        throw new Error('handle method must be overidden')
    }
}
