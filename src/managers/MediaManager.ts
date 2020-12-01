
import { Manager } from './Manager'

import { Media, MediaData } from '../entities/Media'

export type MediaInfoResponseData = {
    items: MediaData[]
    num_results: number
    more_available: boolean
    auto_load_more_enabled: boolean
    status: 'ok' | 'fail'
}

export type EditMediaOptions = {
    mediaId: string
    text: string
}

export type EditMediaResponseData = {
    media: MediaData
    status: 'ok' | 'fail'
}

/**
 * Manages media.
 * 
 * @extends {Manager}
 */
export class MediaManager extends Manager {
    /**
     * Get media by ID and return raw response data.
     * 
     * @public
     * 
     * @param mediaId Media ID
     * 
     * @returns {Promise<MediaInfoResponseData>} 
     */
    public async getRaw (mediaId: string): Promise<MediaInfoResponseData> {
        const data = {
            igtv_feed_preview: false,
            media_id: mediaId
        }

        const response = await this.client.request.send<MediaInfoResponseData>({
            url: `api/v1/media/${mediaId}/info/`,
            data
        })

        return response.body
    }

    /**
     * Get media by ID.
     * 
     * @public
     * 
     * @param mediaId Media ID
     * 
     * @returns {Promise<Media>} 
     */
    public async get (mediaId: string): Promise<Media> {
        const body = await this.getRaw(mediaId)
        return new Media(this.client, body.items[0])
    }

    /**
     * Edit media caption and return raw response data.
     * 
     * @public
     * 
     * @param options Edit options
     * 
     * @returns {Promise<EditMediaResponseData>}
     */
    public async editRaw (options: EditMediaOptions): Promise<EditMediaResponseData> {
        const data = {
            igtv_feed_preview: false,
            media_id: options.mediaId,
            caption_text: options.text
        }

        const response = await this.client.request.send<EditMediaResponseData>({
            url: `api/v1/media/${options.mediaId}/edit_media/`,
            method: 'POST',
            data
        })

        return response.body
    }

    /**
     * Edit media caption.
     * 
     * @public
     * 
     * @param options Edit options
     * 
     * @returns {Promise<Media>}
     */
    public async edit (options: EditMediaOptions): Promise<Media> {
        const body = await this.editRaw(options)
        return new Media(this.client, body.media)
    }
}
