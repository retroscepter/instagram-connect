
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

export type DeleteMediaOptions = {
    mediaId: string
    mediaType?: 'PHOTO' | 'VIDEO' | 'CAROUSEL'
}

export type LikeMediaTimelineModule = {
    name: 'feed_timeline' | 'feed_contextual_post' | 'newsfeed' | 'feed_contextual_newsfeed_multi_media_liked'
}

export type LikeMediaHashtagModule = {
    name: 'feed_contextual_hashtag'
    hashtag: string
}

export type LikeMediaLocationModule = {
    name: 'feed_contextual_location',
    locationId: string | number
}

export type LikeMediaBaseProfileModule = {
    username: string,
    userId: string
}

export type LikeMediaProfileModule = LikeMediaBaseProfileModule & {
    name: 'profile'
}

export type LikeMediaViewProfileModule = LikeMediaBaseProfileModule & {
    name: 'media_view_profile'
}

export type LikeVideoViewProfileModule = LikeMediaBaseProfileModule & {
    name: 'video_view_profile'
}

export type LikePhotoViewProfileModule = LikeMediaBaseProfileModule & {
    name: 'photo_view_profile'
}

export type LikeMediaModule =
    LikeMediaTimelineModule |
    LikeMediaHashtagModule |
    LikeMediaLocationModule |
    LikeMediaProfileModule |
    LikeMediaViewProfileModule |
    LikeVideoViewProfileModule |
    LikePhotoViewProfileModule

export type LikeMediaOptions = {
    mediaId: string
    module?: LikeMediaModule
    doubleTap?: boolean
}

export type UnlikeMediaOptions = {
    mediaId: string
    module?: LikeMediaModule
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

    /**
     * Delete media and return raw response data.
     * 
     * @public
     * 
     * @param options Delete options
     * 
     * @returns  {Promise<unknown>}
     */
    public async deleteRaw (options: DeleteMediaOptions): Promise<unknown> {
        const data = {
            igtv_feed_preview: false,
            media_id: options.mediaId
        }

        const qs = {
            media_type: options.mediaType
        }

        const response = await this.client.request.send<unknown>({
            url: `api/v1/media/${options.mediaId}/delete`,
            method: 'POST',
            data,
            qs
        })

        return response.body
    }

    /**
     * Delete media.
     * 
     * @public
     * 
     * @param options Delete options
     * 
     * @returns {Promise<boolean>}
     */
    public async delete (options: DeleteMediaOptions): Promise<boolean> {
        await this.deleteRaw(options)
        return true
    }

    /**
     * Like or unlike media and return raw response data.
     * 
     * @private
     * 
     * @param action Action
     * @param options Like options
     * 
     * @returns {Promise<unknown>}
     */
    private async likeAction (action: 'like' | 'unlike', options: LikeMediaOptions): Promise<unknown> {
        const data = {
            media_id: options.mediaId,
            module_name: options.module?.name,
            d: options.doubleTap ? 1 : 0,
            ...(options.module || {})
        }

        const response = await this.client.request.send<unknown>({
            url: `api/v1/media/${options.mediaId}/${action}`,
            method: 'POST',
            data
        })

        return response.body
    }

    /**
     * Like media and return raw response data.
     * 
     * @public
     * 
     * @param options Like options
     * 
     * @returns {Promise<unknown>}
     */
    public async likeRaw (options: LikeMediaOptions): Promise<unknown> {
        return this.likeAction('like', options)
    }

    /**
     * Like media.
     * 
     * @public
     * 
     * @param options Like options
     * 
     * @returns {Promise<boolean>}
     */
    public async like (options: LikeMediaOptions): Promise<boolean> {
        await this.likeRaw(options)
        return true
    }

    /**
     * Unlike media and return raw response data.
     * 
     * @public
     * 
     * @param options Unlike options
     * 
     * @returns {Promise<unknown>}
     */
    public async unlikeRaw (options: UnlikeMediaOptions): Promise<unknown> {
        return this.likeAction('unlike', options)
    }

    /**
     * Unlike media.
     * 
     * @public
     * 
     * @param options Unike options
     * 
     * @returns {Promise<boolean>}
     */
    public async unlike (options: UnlikeMediaOptions): Promise<boolean> {
        await this.unlikeRaw(options)
        return true
    }
}
