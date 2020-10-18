
import LRU from 'lru-cache'

import { Manager } from './Manager'

import { DirectThread, DirectThreadData } from '../entities/DirectThread'
import { DirectThreadItem, DirectThreadItemData } from '../entities/DirectThreadItem'

export type DirectInboxData = {
    inbox: DirectInboxInboxData
    seq_id: number
    snapshot_at_ms: number
    pending_requests_total: number
    has_pending_top_requests: boolean
    status: 'ok' | 'failed'
}

export type DirectInboxInboxData = {
    threads: DirectThreadData[]
    has_older: boolean
    unseen_count: number
    unseen_count_ts: number
    oldest_cursor: string
    prev_cursor: DirectInboxCursorData
    next_cursor: DirectInboxCursorData
    blended_inbox_enabled: boolean
}

export type DirectInboxCursorData = {
    cursor_timestamp_seconds: number
    cursor_thread_v2_id: number
}

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
     * @param limit Thread limit
     *
     * @returns {Promise<DirectInboxData>}
     */
    public async getInbox (limit: number = 20): Promise<DirectInboxData> {
        const data = {
            visual_message_return_type: 'unseen',
            thread_message_limit: 10,
            persistentBadging: true,
            limit
        }

        const response = await this.client.request.send<DirectInboxData>({
            url: 'api/v1/direct_v2/inbox',
            data
        })

        this.client.state.irisSequenceId = response.body.seq_id
        this.client.state.irisSnapshotTimestamp = response.body.snapshot_at_ms

        for (const t in response.body.inbox.threads) {
            const threadData = response.body.inbox.threads[t]
            const isNewThread = !this.threads.has(threadData.thread_id)
            this.client.emit(isNewThread ? 'threadCreate' : 'threadUpdate', await this.upsertThread(threadData))
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
     * @returns {Promise<DirectThread>}
     */
    public async upsertThread (data: DirectThreadData): Promise<DirectThread> {
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
     * @returns {Promise<DirectThreadItem | undefined>}
     */
    public async upsertThreadItem (threadId: string, data: DirectThreadItemData): Promise<DirectThreadItem | undefined> {
        const thread = this.threads.get(threadId)
        if (!thread) {
            try {
                /**
                 * If fetching the inbox or finding the new thread
                 * is unsuccessful and throws an error, fall back to
                 * creating a thread item with no parent thread. 
                 */
                await this.getInbox(1)
                const thread = this.threads.get(threadId)
                // @ts-expect-error catch block will handle the thread being undefined
                return thread.upsertItem(data)
            } catch {
                return new DirectThreadItem(this.client, undefined, data)
            }
        } else {
            return thread.upsertItem(data)
        }
    }

    /**
     * Remove thread item from item cache.
     * 
     * @public
     * 
     * @param threadId Thread ID
     * @param itemId Thread item ID
     * 
     * @returns {Promise<void>}
     */
    public async removeThreadItem (threadId: string, itemId: string | number): Promise<void> {
        const thread = this.threads.get(threadId)
        return thread?.removeItem(itemId)
    }
}
