
import { Entity } from './Entity'
import { DirectThreadItem } from './DirectThreadItem'
import { MediaData, MediaImageData, MediaVideoData } from './Media'

export type DirectMediaData = Partial<MediaData> & {
    id: number
    media_type: 1 | 2
    original_width: number
    original_height: number
    video_versions?: DirectMediaVideoData[]
    image_versions2?: {
        candidates: DirectMediaImageData[]
    }
}

export type DirectMediaImageData = MediaImageData

export type DirectMediaVideoData = MediaVideoData

/**
 * Direct media.
 * 
 * @extends {Entity}
 */
export class DirectMedia extends Entity {
    public item?: DirectThreadItem

    public id: string = ''
    public type: 1 | 2 = 1
    public width: number = 0
    public height: number = 0
    public images?: DirectMediaImageData[]
    public videos?: DirectMediaVideoData[]

    /**
     * @param item Item this media belongs to
     * @param data Media data
     */
    constructor (item: DirectThreadItem, data?: DirectMediaData) {
        super(item.client)
        if (item) this.item = item
        if (data) this.update(data)
    }

    /**
     * Update state from media data.
     * 
     * @public
     * 
     * @param data Media data
     * 
     * @returns {DirectMedia}
     */
    public update (data: DirectMediaData): DirectMedia {
        if (typeof data.id === 'number') this.id = BigInt(data.id).toString()
        if (typeof data.media_type === 'number') this.type = data.media_type
        if (typeof data.original_width === 'number') this.width = data.original_width
        if (typeof data.original_height === 'number') this.height = data.original_height
        if (typeof data.video_versions !== 'undefined') {
            this.videos = data.video_versions.map(({ width, height, url, type, id }) => ({ width, height, url, type, id }))
        }
        if (typeof data.image_versions2 !== 'undefined') {
            this.images = data.image_versions2.candidates.map(({ width, height, url }) => ({ width, height, url }))
        }
        return this
    }
}
