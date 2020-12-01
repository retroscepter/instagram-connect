
import { Manager } from './Manager'

import { Media, MediaData } from '../entities/Media'

export type MediaInfoResponseData = {
    items: MediaData[]
    num_results: number
    more_available: boolean
    auto_load_more_enabled: boolean
    status: 'ok' | 'fail'
}

/**
 * Manages media.
 * 
 * @extends {Manager}
 */
export class MediaManager extends Manager {
    /**
     * Get media info by ID.
     * 
     * @public
     * 
     * @param mediaId Media ID
     * 
     * @returns {Promise<unknown>} 
     */
    public async get (mediaId: string): Promise<unknown> {
        const data = {
            igtv_feed_preview: false,
            media_id: mediaId
        }

        const response = await this.client.request.send<MediaInfoResponseData>({
            url: `api/v1/media/${mediaId}/info/`,
            data
        })

        if (!response.body.items[0]) {
            throw new Error('Media not found or unavailable')
        }

        return new Media(this.client, response.body.items[0])
    }
}
