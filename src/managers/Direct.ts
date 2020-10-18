
import LRU from 'lru-cache'

import { Manager } from './Manager'

import { DirectThread, DirectThreadData } from '../entities/DirectThread'
import { DirectThreadItem, DirectThreadItemData } from '../entities/DirectThreadItem'

import { DirectInboxData } from '../responses/Direct'

/**
 * Manages direct threads and messages.
 *
 * @extends {Manager}
 */
export class DirectManager extends Manager {
    threads = new LRU<string, DirectThread>()

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

        this.client.state.irisSequenceId = response.body.seq_id
        this.client.state.irisSnapshotTimestamp = response.body.snapshot_at_ms

        for (const t in response.body.inbox.threads) {
            this.upsertThread(response.body.inbox.threads[t])
        }

        return response.body
    }

    /**
     * Insert or update thread in thread cache.
     * 
     * @public
     *
     * @param data Thread data
     * 
     * @returns {DirectThread}
     */
    public upsertThread (data: DirectThreadData): DirectThread {
        const id = data.thread_id
        const thread = this.threads.get(id)
        if (thread) {
            return thread.update(data)
        } else {
            const newThread = new DirectThread(this.client, data)
            this.threads.set(id, newThread)
            return newThread
        }
    }

    /**
     * Insert or update thread item in item cache.
     * 
     * @public
     * 
     * @param threadId Thread ID
     * @param data Thread item data
     * 
     * @returns {DirectThreadItem | undefined}
     */
    public upsertThreadItem (threadId: string, data: DirectThreadItemData): DirectThreadItem | undefined {
        const thread = this.threads.get(threadId)
        return thread?.upsertItem(data)
    }

    /**
     * Remove thread item from item cache.
     * 
     * @public
     * 
     * @param threadId Thread ID
     * @param itemId Thread item ID
     * 
     * @returns {void}
     */
    public removeThreadItem (threadId: string, itemId: string | number): void {
        const thread = this.threads.get(threadId)
        return thread?.removeItem(itemId)
    }
}
