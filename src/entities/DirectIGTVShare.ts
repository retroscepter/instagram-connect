
import { Entity } from './Entity'
import { DirectThreadItem } from './DirectThreadItem'

export type DirectIGTVShareData = {
    
}

/**
 * Direct IGTV share.
 * 
 * @extends {Entity}
 */
export class DirectIGTVShare extends Entity {
    public item?: DirectThreadItem

    /**
     * @param item Item this IGTV share belongs to
     * @param data IGTV share data
     */
    constructor (item: DirectThreadItem, data?: DirectIGTVShareData) {
        super(item.client)
        if (item) this.item = item
        if (data) this.update(data)
    }

    /**
     * Update state from IGTV share data.
     * 
     * @public
     * 
     * @param data IGTV share data
     * 
     * @returns {DirectIGTVShare}
     */
    public update (data: DirectIGTVShareData): DirectIGTVShare {
        return this
    }
}
