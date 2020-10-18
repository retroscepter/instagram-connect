
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
            const threadData = response.body.inbox.threads[t]
            const isNewThread = this.threads.has(threadData.thread_id)
            this.client.emit(isNewThread ? 'threadCreate' : 'threadUpdate', this.upsertThread(threadData))
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
