
import { Entity } from './Entity'
import { DirectThreadItem } from './DirectThreadItem'

export type DirectStoryShareData = {
    
}

/**
 * Direct story share.
 * 
 * @extends {Entity}
 */
export class DirectStoryShare extends Entity {
    public item?: DirectThreadItem

    /**
     * @param item Item this story share belongs to
     * @param data Story share data
     */
    constructor (item: DirectThreadItem, data?: DirectStoryShareData) {
        super(item.client)
        if (item) this.item = item
        if (data) this.update(data)
    }

    /**
     * Update state from story share data.
     * 
     * @public
     * 
     * @param data Story share data
     * 
     * @returns {DirectStoryShare}
     */
    public update (data: DirectStoryShareData): DirectStoryShare {
        return this
    }
}
