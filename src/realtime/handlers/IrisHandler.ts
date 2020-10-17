
import { Handler } from './Handler'

/**
 * Skywalker subscription message handler
 *
 * @extends {Handler}
 */
export class IrisHandler extends Handler {
    /**
     * Handle a iris message.
     *
     * @public
     *
     * @param data Message data
     *
     * @returns {Promise<T>}
     */
    public async handle (data: Buffer): Promise<void> {

    }
}
