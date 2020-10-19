
import { Entity } from './Entity'
import { DirectThreadItem } from './DirectThreadItem'

export type DirectAnimatedMediaData = {
    id: string
    is_random: boolean
    is_sticker: boolean
    user: DirectAnimatedMediaUserData
    images: {
        fixed_height: DirectAnimatedMediaImageData
    }
}

export type DirectAnimatedMediaImageData = {
    height: number
    mp4: string
    mp4_size: number
    size: number
    url: string
    webp: string
    webp_size: number
    width: number
}

export type DirectAnimatedMediaUserData = {
    is_verified?: boolean
    username: string
}

/**
 * Direct animated media.
 * 
 * @extends {Entity}
 */
export class DirectAnimatedMedia extends Entity {
    public item?: DirectThreadItem

    public id: string = ''
    public isRandom: boolean = false
    public isSticker: boolean = false
    public url: string = ''
    public width: number = 0
    public height: number = 0
    public size: number = 0
    public videoUrl?: string
    public videoSize?: number
    public webpUrl?: string
    public webpSize?: number

    /**
     * @param item Item this animated media belongs to
     * @param data Animated media data
     */
    constructor (item: DirectThreadItem, data?: DirectAnimatedMediaData) {
        super(item.client)
        if (item) this.item = item
        if (data) this.update(data)
    }

    /**
     * Update state from animated media data.
     * 
     * @public
     * 
     * @param data Animated media data
     * 
     * @returns {DirectAnimatedMedia}
     */
    public update (data: DirectAnimatedMediaData): DirectAnimatedMedia {
        if (typeof data.id === 'string') this.id = data.id
        if (typeof data.is_random === 'boolean') this.isRandom = data.is_random
        if (typeof data.is_sticker === 'boolean') this.isSticker = data.is_sticker
        if (typeof data.images !== 'undefined') {
            if (typeof data.images.fixed_height !== 'undefined') {
                this.url = data.images.fixed_height.url
                this.width = data.images.fixed_height.width
                this.height = data.images.fixed_height.height
                this.size = data.images.fixed_height.size
                this.videoUrl = data.images.fixed_height.mp4 || undefined
                this.videoSize = data.images.fixed_height.mp4_size || undefined
                this.webpUrl = data.images.fixed_height.webp || undefined
                this.webpSize = data.images.fixed_height.webp_size || undefined
            }
        }
        return this
    }
}
