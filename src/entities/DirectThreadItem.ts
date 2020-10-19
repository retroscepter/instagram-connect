
import { Client } from '../Client'

import { Entity } from './Entity'
import { User } from './User'
import { DirectThread } from './DirectThread'
import { DirectMedia, DirectMediaData } from './DirectMedia'
import { DirectMediaShare } from './DirectMediaShare'
import { DirectStoryShare } from './DirectStoryShare'
import { DirectIGTVShare } from './DirectIGTVShare'
import { DirectStoryMedia } from './DirectStoryMedia'
import { DirectAnimatedMedia, DirectAnimatedMediaData } from './DirectAnimatedMedia'
import { DirectVoiceMedia, DirectVoiceMediaData } from './DirectVoiceMedia'
import { DirectActionLog, DirectActionLogData } from './DirectActionLog'


export type DirectThreadItemType =
    'text' |
    'media' |
    'media_share' |
    'story_share' |
    'felix_share' |
    'raven_media' |
    'animated_media' |
    'voice_media' |
    'action_log'

export type DirectThreadItemData = {
    item_id: number
    user_id: number
    timestamp: number
    item_type: DirectThreadItemType
    thread_id: string
    text?: string
    media?: DirectMediaData
    media_share?: any
    story_share?: any
    felix_share?: any
    visual_media?: any
    animated_media?: DirectAnimatedMediaData
    voice_media?: DirectVoiceMediaData
    action_log?: DirectActionLogData
    client_context: number
    show_forward_attribution: boolean
    is_shh_mode: boolean
}

export class DirectThreadItem extends Entity {
    public thread?: DirectThread

    public id: string = ''
    public user?: User
    public userId?: string
    public threadId?: string
    public timestamp: number = Date.now()
    public type: DirectThreadItemType = 'text'
    public text?: string
    public media?: DirectMedia
    public mediaShare?: any
    public storyShare?: any
    public igtvShare?: any
    public storyMedia?: any
    public voiceMedia?: DirectVoiceMedia
    public animatedMedia?: DirectAnimatedMedia
    public actionLog?: DirectActionLog

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
        if (typeof data.item_id !== 'undefined') this.id = BigInt(data.item_id).toString()
        if (typeof data.thread_id === 'string') this.threadId = data.thread_id
        if (this.thread) this.threadId = this.thread.id
        if (typeof data.user_id === 'number') {
            this.userId = BigInt(data.user_id).toString()
            this.user = this.thread?.users.find(user => user.id === this.userId)
        }
        if (typeof data.timestamp === 'number') this.timestamp = data.timestamp
        if (typeof data.item_type === 'string') this.type = data.item_type
        if (typeof data.text === 'string') this.text = data.text
        if (typeof data.media !== 'undefined') this.media = new DirectMedia(this, data.media)
        if (typeof data.media_share !== 'undefined') this.mediaShare = data.media_share
        if (typeof data.story_share !== 'undefined') this.storyShare = data.story_share
        if (typeof data.felix_share !== 'undefined') this.igtvShare = data.felix_share
        if (typeof data.visual_media !== 'undefined') this.storyMedia = data.visual_media
        if (typeof data.animated_media !== 'undefined') this.animatedMedia = new DirectAnimatedMedia(this, data.animated_media)
        if (typeof data.voice_media !== 'undefined') this.voiceMedia = new DirectVoiceMedia(this, data.voice_media)
        if (typeof data.action_log !== 'undefined') this.actionLog = new DirectActionLog(this, data.action_log)
        return this
    }
}
