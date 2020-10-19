
import { Entity } from './Entity'
import { DirectThreadItem } from './DirectThreadItem'

export type DirectStoryMediaData = {
    
}

/**
 * Direct story media.
 * 
 * @extends {Entity}
 */
export class DirectStoryMedia extends Entity {
    public item?: DirectThreadItem

    /**
     * @param item Item this story media belongs to
     * @param data Story media data
     */
    constructor (item: DirectThreadItem, data?: DirectStoryMediaData) {
        super(item.client)
        if (item) this.item = item
        if (data) this.update(data)
    }

    /**
     * Update state from story media data.
     * 
     * @public
     * 
     * @param data Story media data
     * 
     * @returns {DirectStoryMedia}
     */
    public update (data: DirectStoryMediaData): DirectStoryMedia {
        return this
    }
}
