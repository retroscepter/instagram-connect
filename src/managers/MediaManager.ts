
import { Chance } from 'chance'

import { Manager } from './Manager'

import { Media, MediaData } from '../entities/Media'

export type MediaInfoResponseData = {
    items: MediaData[]
    num_results: number
    more_available: boolean
    auto_load_more_enabled: boolean
    status: 'ok' | 'fail'
}

export type MediaManagerEditOptions = {
    mediaId: string
    text: string
}

export type MediaEditResponseData = {
    media: MediaData
    status: 'ok' | 'fail'
}

export type MediaManagerDeleteOptions = {
    mediaId: string
    mediaType?: 'PHOTO' | 'VIDEO' | 'CAROUSEL'
}

type LikeMediaTimelineModule = {
    name: 'feed_timeline' | 'feed_contextual_post' | 'newsfeed' | 'feed_contextual_newsfeed_multi_media_liked'
}

type LikeMediaHashtagModule = {
    name: 'feed_contextual_hashtag'
    hashtag: string
}

type LikeMediaLocationModule = {
    name: 'feed_contextual_location',
    locationId: string | number
}

type LikeMediaBaseProfileModule = {
    username: string,
    userId: string
}

type LikeMediaProfileModule = LikeMediaBaseProfileModule & {
    name: 'profile'
}

type LikeMediaViewProfileModule = LikeMediaBaseProfileModule & {
    name: 'media_view_profile'
}

type LikeVideoViewProfileModule = LikeMediaBaseProfileModule & {
    name: 'video_view_profile'
}

type LikePhotoViewProfileModule = LikeMediaBaseProfileModule & {
    name: 'photo_view_profile'
}

export type MediaLikeModule =
    LikeMediaTimelineModule |
    LikeMediaHashtagModule |
    LikeMediaLocationModule |
    LikeMediaProfileModule |
    LikeMediaViewProfileModule |
    LikeVideoViewProfileModule |
    LikePhotoViewProfileModule

export type MediaManagerLikeOptions = {
    mediaId: string
    module?: MediaLikeModule
    doubleTap?: boolean
}

export type MediaManagerUnlikeOptions = {
    mediaId: string
    module?: MediaLikeModule
}

export type MediaManagerCommentOptions = {
    mediaId: string
    text: string
    replyTo: string
    module?: 'self_comments_v2'
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
     * @returns {Promise<MediaEditResponseData>}
     */
    public async editRaw (options: MediaManagerEditOptions): Promise<MediaEditResponseData> {
        const data = {
            igtv_feed_preview: false,
            media_id: options.mediaId,
            caption_text: options.text
        }

        const response = await this.client.request.send<MediaEditResponseData>({
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
    public async edit (options: MediaManagerEditOptions): Promise<Media> {
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
    public async deleteRaw (options: MediaManagerDeleteOptions): Promise<unknown> {
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
    public async delete (options: MediaManagerDeleteOptions): Promise<boolean> {
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
    private async likeAction (action: 'like' | 'unlike', options: MediaManagerLikeOptions): Promise<unknown> {
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
    public async likeRaw (options: MediaManagerLikeOptions): Promise<unknown> {
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
    public async like (options: MediaManagerLikeOptions): Promise<boolean> {
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
    public async unlikeRaw (options: MediaManagerUnlikeOptions): Promise<unknown> {
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
    public async unlike (options: MediaManagerUnlikeOptions): Promise<boolean> {
        await this.unlikeRaw(options)
        return true
    }

    /**
     * Comment on media and return raw response data.
     * 
     * @public
     * 
     * @param options Comment options
     * 
     * @returns {Promise<unknown>}
     */
    public async commentRaw (options: MediaManagerCommentOptions): Promise<unknown> {
        const data = {
            idempotence_token: new Chance().guid(),
            comment_text: options.text,
            containermodule: options.module || 'self_comments_v2',
            replied_to_comment_id: options.replyTo
        }

        const response = await this.client.request.send<unknown>({
            url: `api/v1/media/${options.mediaId}/comment/`,
            method: 'POST',
            data
        })

        return response.body
    }

    /**
     * Comment on media.
     * 
     * @public
     * 
     * @param options Comment options
     * 
     * @returns {Promise<void>}
     */
    public async comment (options: MediaManagerCommentOptions): Promise<void> {
        await this.commentRaw(options)
    }
}
