
import LRU from 'lru-cache'

import { Client } from '../Client'

import { Entity } from './Entity'
import { User, UserData, UserFriendshipStatusData } from './User'
import { DirectThreadItem, DirectThreadItemData } from './DirectThreadItem'

export type DirectThreadData = {
    thread_id: string
    thread_v2_id: string
    admin_user_ids: string[]
    users: DirectThreadUserData[]
    items: DirectThreadItemData[]
    last_activity_at: number
    muted: boolean
    is_pin: boolean
    named: boolean
    canonical: boolean
    pending: boolean
    archived: boolean
    thread_type: string
    viewer_id: number
    thread_title: string
    folder: number
    vc_muted: boolean
    is_group: boolean
    mentions_muted: boolean
    approval_required_for_new_members: boolean
    input_mode: number
    business_thread_folder: number
    read_state: number
    last_non_sender_item_at: number
    assigned_admin_id: number
    shh_mode_enabled: boolean
    has_older: boolean
    has_newer: boolean
    last_seen_at: DirectThreadLastSeenData[]
    newest_cursor: string
    oldest_cursor: string
    next_cursor: string
    prev_cursor: string
    last_permanent_item: DirectThreadItemData
    last_mentioned_item_id: number
}

export type DirectThreadUserData = Partial<UserData> & {
    pk: number
    username: string
    full_name: string
    is_private: boolean
    profile_pic_url: string,
    friendship_status: UserFriendshipStatusData
    is_verified: boolean
    has_anonymous_profile_picture: boolean
    has_threads_app: boolean
    is_using_unified_inbox_for_direct: boolean
    interop_messaging_user_fbid: number
    account_badges: any[]
}

export type DirectThreadLastSeenData = {
    timestamp: string
    item_id: string
}

export class DirectThread extends Entity {
    public id: string = ''
    public users: User[] = []
    public lastActivityTimestamp: number = Date.now()
    public muted: boolean = false
    public pinned: boolean = false
    public named: boolean = false
    public pending: boolean = false
    public archived: boolean = false
    public group: boolean = false
    public type: string = ''
    public title: string = ''
    public videoCallMuted: boolean = false
    public mentionsMuted: boolean = false
    public approvalRequired: boolean = false
    public seen: boolean = false

    public items = new LRU<string, DirectThreadItem>({ max: 200 })

    /**
     * @param client Client managing this thread
     * @param data Thread data
     */
    constructor (client: Client, data?: DirectThreadData) {
        super(client)
        if (data) this.update(data)
    }

    /**
     * Update state from thread data.
     *
     * @public
     * 
     * @param data Thread data
     * 
     * @returns {Promise<DirectThread>}
     */
    public async update (data: DirectThreadData): Promise<DirectThread> {
        if (data.thread_id) this.id = data.thread_id
        if (data.last_activity_at) this.lastActivityTimestamp = data.last_activity_at
        if (data.muted) this.muted = data.muted
        if (data.is_pin) this.pinned = data.is_pin
        if (data.named) this.named = data.named
        if (data.pending) this.pending = data.pending
        if (data.archived) this.archived = data.archived
        if (data.thread_type) this.type = data.thread_type
        if (data.thread_title) this.title = data.thread_title
        if (data.is_group) this.group = data.is_group
        if (data.vc_muted) this.videoCallMuted = data.vc_muted
        if (data.mentions_muted) this.mentionsMuted = data.mentions_muted
        if (data.approval_required_for_new_members) this.approvalRequired = data.approval_required_for_new_members
        if (data.read_state) this.seen = data.read_state === 1 ? true : false
        if (data.items) for (const i in data.items) await this.upsertItem(data.items[i])
        if (data.users) this.users = data.users.map(user => this.client.users.upsertUser(user))
        return this
    }

    /**
     * Insert or update thread item in item cache.
     *
     * @public
     *
     * @param data Thread item data.
     * 
     * @returns {DirectThreadItem | undefined}
     */
    public upsertItem (data: DirectThreadItemData): DirectThreadItem | undefined {
        if (!data.item_id) return
        const id = BigInt(data.item_id).toString()
        const item = this.items.get(id)
        if (item) {
            return item.update(data)
        } else {
            const newItem = new DirectThreadItem(this, data)
            this.items.set(id, newItem)
            return newItem
        }
    }

    /**
     * Remove thread item from the item cache.
     *
     * @public 
     *
     * @param id ID of the thread item
     * 
     * @returns {void}
     */
    public removeItem (id: number | string): void {
        this.items.del(typeof id === 'string' ? id : BigInt(id).toString())
    }
}
