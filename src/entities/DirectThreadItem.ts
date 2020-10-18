
import { Entity } from './Entity'

import { User } from './User'
import { DirectThread } from './DirectThread'
import { Client } from '../Client'

export type DirectThreadItemData = {
    item_id: number
    user_id: number
    timestamp: number
    item_type: string
    text?: string
    media?: any
    media_share?: any
    story_share?: any
    felix_share?: any
    visual_media?: any
    animated_media?: any
    voice_media?: any
    action_log?: any
    client_context: number
    show_forward_attribution: boolean
    is_shh_mode: boolean
}

export class DirectThreadItem extends Entity {
    public thread?: DirectThread

    public id: string = ''
    public user?: User
    public userId?: string
    public timestamp: number = Date.now()
    public type: string = ''
    public text?: string
    public media?: any
    public mediaShare?: any
    public storyShare?: any
    public igtvShare?: any
    public storyMedia?: any
    public voiceMedia?: any
    public animatedMedia?: any
    public actionLog?: any

    /**
     * @param client Client managing this item
     * @param thread Thread managing this item
     * @param data Thread item data
     */
    constructor (client: Client, thread?: DirectThread, data?: DirectThreadItemData) {
        super(client)
        if (thread) this.thread = thread
        if (data) this.update(data)
    }

    /**
     * Update state from thread item data.
     *
     * @public
     * 
     * @param data Thread item data
     * 
     * @returns {DirectThreadItem}
     */
    public update (data: DirectThreadItemData): DirectThreadItem {
        if (data.item_id) this.id = BigInt(data.item_id).toString()
        if (data.user_id) {
            this.userId = BigInt(data.user_id).toString()
            this.user = this.thread?.users.find(user => user.id === this.userId)
        }
        if (data.timestamp) this.timestamp = data.timestamp
        if (data.item_type) this.type = data.item_type
        if (data.text) this.text = data.text
        if (data.media) this.media = data.media
        if (data.media_share) this.media = data.media
        if (data.story_share) this.storyShare = data.story_share
        if (data.felix_share) this.igtvShare = data.felix_share
        if (data.visual_media) this.storyMedia = data.visual_media
        if (data.animated_media) this.animatedMedia = data.animated_media
        if (data.voice_media) this.voiceMedia = data.voice_media
        if (data.action_log) this.actionLog = data.action_log
        return this
    }
}
