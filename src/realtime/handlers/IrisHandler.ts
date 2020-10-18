
import { Handler } from './Handler'

import { DirectThreadData } from '../../entities/DirectThread'
import { DirectThreadItemData } from '../../entities/DirectThreadItem'

export type IrisEventData = {
    event: string
    data: IrisEventOperationData[]
    message_type: number
    seq_id: number
    mutation_token: string | null
    realtime: boolean
}

export type IrisEventOperationData = {
    op: 'add' | 'replace' | 'remove' | 'notify'
    path: string
    value: any
}

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
    public async handle (data: IrisEventData[]): Promise<void> {
        for (const e in data) {
            const event = data[e]
            this.realtime.client.state.irisSequenceId = event.seq_id
            this.realtime.client.state.irisSnapshotTimestamp = Date.now()

            for (const o in event.data) {
                const operation = event.data[o]

                if (!operation.value) return
                
                switch (operation.op) {
                    case 'add': await this.handleAdd(operation); break
                    case 'replace': await this.handleReplace(operation); break
                    case 'remove': await this.handleRemove(operation); break
                    case 'notify': await this.handleNotify(operation); break
                }
            }
        }
    }

    /**
     * Handle message add operation.
     * 
     * @private
     * 
     * @param operation Operation data
     * 
     * @returns {Promise<void>} 
     */
    private async handleAdd (operation: IrisEventOperationData): Promise<void> {
        const path = operation.path

        if (path.startsWith('/direct_v2/threads')) {
            if (!path.includes('activity_indicator_id')) {
                this.upsertThreadItem(operation, true)
            }
        }

        if (path.startsWith('/direct_v2/inbox/threads')) {
            this.upsertThread(operation, true)
        }
    }

    /**
     * Handle message replace operation.
     * 
     * @private
     * 
     * @param operation Operation data
     * 
     * @returns {Promise<void>} 
     */
    private async handleReplace (operation: IrisEventOperationData): Promise<void> {
        const path = operation.path

        if (path.startsWith('/direct_v2/threads')) {
            if (!path.endsWith('has_seen')) {
                this.upsertThreadItem(operation, false)
            }
        }

        if (path.startsWith('/direct_v2/inbox/threads')) {
            this.upsertThread(operation, false)
        }
    }

    /**
     * Handle message remove operation.
     * 
     * @private
     * 
     * @param operation Operation data
     * 
     * @returns {Promise<void>} 
     */
    private async handleRemove (operation: IrisEventOperationData): Promise<void> {
        const path = operation.path
        
        if (path.startsWith('/direct_v2')) {
            this.removeThreadItem(operation)
        }
    }

    /**
     * Handle message notify operation.
     * 
     * @private
     * 
     * @param operation Operation data
     * 
     * @returns {Promise<void>} 
     */
    private async handleNotify (operation: IrisEventOperationData): Promise<void> {

    }

    /**
     * Upsert thread to thread cache from operation data.
     * 
     * @private
     * 
     * @param operation Operation data
     * @param create Whether thread was created or updated
     * 
     * @return {void}
     */
    private upsertThread (operation: IrisEventOperationData, create: boolean): void {
        const thread = this.realtime.client.direct.upsertThread(operation.value)
        this.realtime.client.emit(create ? 'threadCreate' : 'threadUpdate', thread)
    }

    /**
     * Upsert thread item to item cache from operation data.
     * 
     * @private
     * 
     * @param operation Operation data
     * @param create Whether thread item was created or updated
     * 
     * @returns {void}
     */
    private upsertThreadItem (operation: IrisEventOperationData, create: boolean): void {
        const threadId = operation.path.split('/')[3]
        const item = this.realtime.client.direct.upsertThreadItem(threadId, operation.value)
        if (item) this.realtime.client.emit(create ? 'threadItemCreate' : 'threadItemUpdate', item)
    }

    /**
     * Remove thread item from item cache from operation data.
     * 
     * @private
     * 
     * @param operation Operation data
     * 
     * @returns {void}
     */
    private removeThreadItem (operation: IrisEventOperationData): void {
        const split = operation.path.split('/')
        const threadId = split[3]
        const itemId = split[5]
        this.realtime.client.direct.removeThreadItem(threadId, itemId)
        this.realtime.client.emit('threadItemRemove', threadId, itemId)
    }
}
