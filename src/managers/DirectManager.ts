
import LRU from 'lru-cache'

import { Manager } from './Manager'

import { DirectThread, DirectThreadData } from '../entities/DirectThread'
import { DirectThreadItem, DirectThreadItemData } from '../entities/DirectThreadItem'

export type DirectInboxResponseData = {
    status: 'ok' | 'fail'
    inbox: DirectInboxData
    seq_id: number
    snapshot_at_ms: number
    pending_requests_total: number
    has_pending_top_requests: boolean
}

export type DirectInboxData = {
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

export type DirectThreadResponseData = {
    status: 'ok' | 'fail'
    thread: DirectThreadData
}

/**
 * Manages direct threads and messages.
 *
 * @extends {Manager}
 */
export class DirectManager extends Manager {
    threads = new LRU<string, DirectThread>()

    /**
     * Get direct inbox threads and return raw response data.
     * 
     * @public
     * 
     * @param limit Thread limit
     *
     * @returns {Promise<DirectInboxData>}
     */
    public async getInboxRaw (limit: number = 20): Promise<DirectInboxResponseData> {
        const data = {
            visual_message_return_type: 'unseen',
            thread_message_limit: 10,
            persistentBadging: true,
            limit
        }

        const response = await this.client.request.send<DirectInboxResponseData>({
            url: 'api/v1/direct_v2/inbox',
            data
        })

        return response.body
    }

    /**
     * Get direct inbox threads and update state and thread cache.
     * 
     * @public
     * 
     * @param limit Thread limit
     * 
     * @returns {Promise<DirectThread[]>}
     */
    public async getInbox (limit: number = 20): Promise<DirectThread[]> {
        const response = await this.getInboxRaw(limit)

        this.client.state.irisSequenceId = response.seq_id
        this.client.state.irisSnapshotTimestamp = response.snapshot_at_ms
        
        const threads: DirectThread[] = []

        for (const t in response.inbox.threads) {
            const threadData = response.inbox.threads[t]
            const isNewThread = !this.threads.has(threadData.thread_id)
            const event = isNewThread ? 'threadCreate' : 'threadUpdate'
            const thread = this.upsertThread(threadData)
            this.client.emit(event, thread)
            threads.push(thread)
        }

        return threads
    }

    /**
     * Get thread by ID and return raw response data.
     * 
     * @public
     *
     * @param id Thread ID.
     * 
     * @returns {Promise<any>}
     */
    public async getThreadRaw (id: string): Promise<DirectThreadResponseData> {
        const data = {
            visual_message_return_type: 'unseen',
            limit: 10
        }

        const response = await this.client.request.send<DirectThreadResponseData>({
            url: `api/v1/direct_v2/threads/${id}/`,
            data
        })

        return response.body
    }

    /**
     * Get thread by ID and update thread cache.
     * 
     * @public
     * 
     * @param id Thread ID
     * 
     * @returns {Promise<DirectThread | undefined>}
     */
    public async getThread (id: string): Promise<DirectThread | undefined> {
        const { thread: threadData } = await this.getThreadRaw(id)
        if (threadData) return this.upsertThread(threadData)
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
     * @returns {Promise<DirectThreadItem | undefined>}
     */
    public async upsertThreadItem (threadId: string, data: DirectThreadItemData): Promise<DirectThreadItem | undefined> {
        const thread = this.threads.get(threadId)
        if (!thread) {
            try {
                /**
                 * If fetching the thread or finding the new thread
                 * is unsuccessful and throws an error, fall back to
                 * creating a thread item with no parent thread. 
                 */
                const thread = await this.getThread(threadId)
                // @ts-expect-error this is intential as the catch block will handle this being undefined
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
