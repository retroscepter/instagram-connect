
import { Manager } from './Manager'

import { DirectInboxData, DirectInboxInboxData } from '../responses/Direct'

/**
 * Manages direct threads and messages.
 * 
 * @extends {Manager}
 */
export class DirectManager extends Manager {
    public sequenceId?: number
    public snapshotTimestamp?: number

    /**
     * Get direct inbox threads.
     * 
     * @public
     *
     * @returns {Promise<DirectInboxData>}
     */
    public async getInbox (): Promise<DirectInboxData> {
        const data = {
            visual_message_return_type: 'unseen',
            thread_message_limit: 10,
            persistentBadging: true,
            limit: 20
        }

        const response = await this.client.request.send<DirectInboxData>({
            url: 'api/v1/direct_v2/inbox',
            data
        })

        this.sequenceId = response.body.seq_id
        this.snapshotTimestamp = response.body.snapshot_at_ms

        return response.body
    }
}
