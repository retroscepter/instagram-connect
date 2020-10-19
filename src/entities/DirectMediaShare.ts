
import { Media, MediaData } from './Media'
import { DirectThreadItem } from './DirectThreadItem'

/**
 * Direct media share.
 * 
 * @extends {Entity}
 */
export class DirectMediaShare extends Media {
    public item?: DirectThreadItem

    /**
     * @param item Item this media share belongs to
     * @param data Media share data
     */
    constructor (item: DirectThreadItem, data?: MediaData) {
        super(item.client, data)
        if (item) this.item = item
        if (data) this.update(data)
    }
}
