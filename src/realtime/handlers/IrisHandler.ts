
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
    public async handle (data: any): Promise<void> {
        for (const e in data) {
            const event = data[e]
            this.realtime.client.state.irisSequenceId = event.seq_id
            this.realtime.client.state.irisSnapshotTimestamp = Date.now()
        }
    }
}
