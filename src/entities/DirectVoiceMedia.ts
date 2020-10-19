
import { Entity } from './Entity'
import { UserFriendshipStatusData } from './User'
import { DirectThreadItem } from './DirectThreadItem'

export type DirectVoiceMediaData = {
    media: DirectVoiceSubMediaData
    is_shh_mode: boolean
    seen_user_ids: number[]
    view_mode: string
    seen_count: number
}

export type DirectVoiceSubMediaData = {
    id: string
    media_type: number
    product_type: string
    organic_tracking_token: string
    audio: DirectVoiceAudioData
    user: DirectVoiceUserData
}

export type DirectVoiceAudioData = {
    audio_src: string
    duration: number
    waveform_data: any
    waveform_sampling_frequency_hz: number
}

export type DirectVoiceUserData = {
    pk: number
    friendship_status: UserFriendshipStatusData
    username: string
}

/**
 * Direct voice media.
 * 
 * @extends {Entity}
 */
export class DirectVoiceMedia extends Entity {
    public item?: DirectThreadItem

    public id: string = ''
    public seenUserIds: string[] = []
    public seenCount: number = 0
    public src: string = ''
    public duration: number = 0
    public waveform: number[] = []
    public waveformFrequency: number = 0

    /**
     * @param item Item this voice media belongs to
     * @param data Voice media data
     */
    constructor (item: DirectThreadItem, data?: DirectVoiceMediaData) {
        super(item.client)
        if (item) this.item = item
        if (data) this.update(data)
    }

    /**
     * Update state from voice media data.
     * 
     * @public
     * 
     * @param data Voice media data
     * 
     * @returns {DirectVoiceMedia}
     */
    public update (data: DirectVoiceMediaData): DirectVoiceMedia {
        if (Array.isArray(data.seen_user_ids)) {
            this.seenUserIds = data.seen_user_ids.map(i => BigInt(i).toString())
            this.seenCount = this.seenUserIds.length
        }
        if (typeof data.seen_count === 'number') this.seenCount = data.seen_count
        if (typeof data.media !== 'undefined') {
            const media = data.media
            if (typeof media.id === 'string') this.id = media.id
            if (typeof media.audio !== 'undefined') {
                const audio = media.audio
                if (typeof audio.audio_src === 'string') this.src = audio.audio_src
                if (typeof audio.duration === 'string') this.duration = audio.duration
                if (Array.isArray(audio.waveform_data)) this.waveform = audio.waveform_data
                if (typeof audio.waveform_sampling_frequency_hz === 'number') this.waveformFrequency = audio.waveform_sampling_frequency_hz
            }
        }
        return this
    }
}
