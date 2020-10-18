
import { Entity } from './Entity'
import { DirectThread } from './DirectThread'

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
    voice_media?: any
    client_context: number
    show_forward_attribution: boolean
    is_shh_mode: boolean
}

export class DirectThreadItem extends Entity {
    public thread: DirectThread

    public id: string = ''
    public userId: string = ''
    public timestamp: number = Date.now()
    public type: string = ''
    public text?: string
    public media?: any
    public mediaShare?: any
    public storyShare?: any
    public igtvShare?: any
    public story?: any
    public voice?: any

    /**
     * @param thread Thread managing this item
     * @param data Thread item data
     */
    constructor (thread: DirectThread, data?: DirectThreadItemData) {
        super(thread.client)
        this.thread = thread
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
        if (data.user_id) this.userId = BigInt(data.user_id).toString()
        if (data.timestamp) this.timestamp = data.timestamp
        if (data.item_type) this.type = data.item_type
        if (data.text) this.text = data.text
        if (data.media) this.media = data.media
        if (data.media_share) this.media = data.media
        if (data.story_share) this.storyShare = data.story_share
        if (data.felix_share) this.igtvShare = data.felix_share
        if (data.visual_media) this.story = data.visual_media
        if (data.voice_media) this.voice = data.voice_media
        return this
    }
}
