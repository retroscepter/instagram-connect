
import { Client } from '../Client'

import { Entity } from './Entity'
import { User, UserData } from './User'
import { MediaManagerCommentOptions, MediaManagerEditOptions, MediaManagerLikeOptions, MediaManagerUnlikeOptions } from '../managers'

export type MediaData = {
    taken_at: number
    pk: number
    id: string
    device_timestamp: number
    media_type: 1 | 2
    code: string
    client_cache_key: string
    filter_type: number
    user: Partial<UserData>
    can_viewer_reshare: boolean
    caption_is_edited: boolean
    comment_likes_enabled: boolean
    comment_threading_enabled: boolean
    has_more_comments: boolean
    max_num_visible_preview_comments: number
    can_view_more_preview_comments: boolean
    comment_count: number
    inline_composer_display_condition: string
    inline_composer_imp_trigger_time: number
    like_count: number
    has_liked: boolean
    top_likers: (string | number)[]
    photo_of_you: boolean
    can_see_insights_as_brand: boolean
    is_dash_eligible?: number
    video_dash_manifest?: string
    video_codec?: string
    number_of_qualities?: number
    has_audio?: boolean
    video_duration?: number
    caption: MediaCaptionData
    can_viewer_save: boolean
    organic_tracking_token: string
    sharing_friction_info: MediaSharingFrictionData
    is_in_profile_grid: boolean
    profile_grid_control_enabled: boolean
    is_shop_the_look_eligible: boolean
    deleted_reason: number
    original_width: number
    original_height: number
    video_versions?: MediaVideoData[]
    image_versions2?: {
        candidates: MediaImageData[]
    }
}

export type MediaCaptionData = {
    pk: number
    user_id: number
    text: string
    type: number
    created_at: number
    created_at_utc: number
    content_type: string
    status: string
    bit_flags: number
    did_report_as_spam: boolean
    share_enabled: boolean
    user: Partial<UserData>
    is_covered: boolean
    media_id: number
    private_reply_status: number
}

export type MediaSharingFrictionData = {
    should_have_sharing_friction: boolean
    bloks_app_url: string | null
}

export type MediaImageData = {
    url: string
    width: number
    height: number
}

export type MediaVideoData = MediaImageData & {
    id: number | string
    type: number
}

export type MediaInternalCaptionData = {
    user: User
    text: string
    type: number
    createdAtTimestamp: number
    createdAtUTC: number
    contentType: string
    status: string
    flags: number
    reportedAsSpam: boolean
    canShare: boolean
    covered: boolean
    media: Media
    privateReplyStatus: number
}

export type MediaIntervalSharingFrictionData = {
    shouldHaveFriction: boolean
    bloksAppUrl: string | null
}

export type MediaEditOptions = MediaManagerEditOptions & {
    mediaId: never
}

export type MediaLikeOptions = MediaManagerLikeOptions & {
    mediaId: never
}

export type MediaUnlikeOptions = MediaManagerUnlikeOptions & {
    mediaId: never
}

export type MediaCommentOptions = MediaManagerCommentOptions & {
    mediaId: never
}

/**
 * Media.
 * 
 * @extends {Entity}
 */
export class Media extends Entity {
    public id = ''
    public type: 1 | 2 | 8 = 1
    public width = 0
    public height = 0
    public user?: User
    public code = ''
    public cacheKey = ''
    public filterType = 0
    public canReshare = true
    public captionIsEdited = false
    public commentLikingEnabled = true
    public commentThreadingEnabled = true
    public hasMoreComments = true
    public maxVisiblePreviewComments = 0
    public canViewMorePreviewComments = false
    public commentCount = 0
    public likeCount = 0
    public liked = false
    public topLikers: string[] = []
    public photoOfYou = false
    public videoDashManifest?: string
    public codec?: string
    public qualityCount?: number
    public hasAudio?: boolean
    public duration?: number
    public caption?: MediaInternalCaptionData
    public sharingFriction?: MediaIntervalSharingFrictionData
    public images: MediaImageData[] = []
    public videos?: MediaVideoData[]

    /**
     * @param client Client managing this media
     * @param data Media data
     */
    constructor (client: Client, data?: MediaData) {
        super(client)
        if (data) this.update(data)
    }

    /**
     * Get media info and update state.
     * 
     * @public
     * 
     * @returns {Promise<Media>}
     */
    public async getMore (): Promise<Media> {
        const { items } = await this.client.media.getRaw(this.id)
        if (items[0]) return this.update(items[0])
        return this
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
    public async edit (options: MediaEditOptions): Promise<Media> {
        const { media } = await this.client.media.editRaw({ ...options, mediaId: this.id, })
        return this.update(media)
    }

    /**
     * Delete media.
     * 
     * @public
     * 
     * @returns {Promise<void>}
     */
    public async delete (): Promise<void> {
        const mediaType =
            this.type === 1 && 'PHOTO' ||
            this.type === 2 && 'VIDEO' ||
            this.type === 8 && 'CAROUSEL' ||
            'PHOTO'
        await this.client.media.deleteRaw({ mediaId: this.id, mediaType })
    }

    /**
     * Like media.
     * 
     * @public
     * 
     * @param options Like options
     * 
     * @returns {Promise<Media>}
     */
    public async like (options: MediaLikeOptions): Promise<Media> {
        await this.client.media.likeRaw({ ...options, mediaId: this.id })
        return this
    }

    /**
     * Unike media.
     * 
     * @public
     * 
     * @param options Unlike options
     * 
     * @returns {Promise<Media>}
     */
    public async unlike (options: MediaUnlikeOptions): Promise<Media> {
        await this.client.media.unlikeRaw({ ...options, mediaId: this.id })
        return this
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
    public async comment (options: MediaCommentOptions): Promise<void> {
        await this.client.media.comment({ ...options, mediaId: this.id })
    }

    /**
     * Update state from media data.
     * 
     * @public
     * 
     * @param data Media data
     * 
     * @returns {Media}
     */
    public update (data: MediaData): Media {
        if (data.id) this.id = typeof data.id === 'string' ? data.id : BigInt(data.id).toString()
        if (typeof data.media_type === 'number') this.type = data.media_type
        if (typeof data.user !== 'undefined') this.user = new User(this.client, data.user)
        if (typeof data.code === 'string') this.code = data.code
        if (typeof data.original_width === 'number') this.width = data.original_width
        if (typeof data.original_height === 'number') this.height = data.original_height
        if (typeof data.client_cache_key === 'string') this.cacheKey = data.client_cache_key
        if (typeof data.filter_type === 'number') this.filterType = data.filter_type
        if (typeof data.can_viewer_reshare === 'boolean') this.canReshare = data.can_viewer_reshare
        if (typeof data.caption_is_edited === 'boolean') this.captionIsEdited = data.caption_is_edited
        if (typeof data.comment_likes_enabled === 'boolean') this.commentLikingEnabled = data.comment_likes_enabled
        if (typeof data.comment_threading_enabled === 'boolean') this.commentThreadingEnabled = data.comment_threading_enabled
        if (typeof data.has_more_comments === 'boolean') this.hasMoreComments = data.has_more_comments
        if (typeof data.max_num_visible_preview_comments === 'number') this.maxVisiblePreviewComments = data.max_num_visible_preview_comments
        if (typeof data.can_view_more_preview_comments === 'number') this.canViewMorePreviewComments = data.can_view_more_preview_comments!
        if (typeof data.comment_count === 'number') this.commentCount = data.comment_count
        if (typeof data.like_count === 'number') this.likeCount = data.like_count
        if (typeof data.has_liked === 'boolean') this.liked = data.has_liked
        if (typeof data.top_likers !== 'undefined') {
            this.topLikers = data.top_likers.map(t => typeof t === 'string' ? t : BigInt(t).toString())
        }
        if (typeof data.photo_of_you === 'boolean') this.photoOfYou = data.photo_of_you
        if (typeof data.video_dash_manifest === 'string') this.videoDashManifest = data.video_dash_manifest
        if (typeof data.video_codec === 'string') this.codec = data.video_codec
        if (typeof data.number_of_qualities === 'number') this.qualityCount = data.number_of_qualities
        if (typeof data.has_audio === 'boolean') this.hasAudio = data.has_audio
        if (typeof data.video_duration === 'number') this.duration = data.video_duration
        if (data.caption) {
            const caption = data.caption
            this.caption = {
                user: new User(this.client, caption.user),
                text: caption.text,
                type: caption.type,
                createdAtTimestamp: caption.created_at,
                createdAtUTC: caption.created_at_utc,
                contentType: caption.content_type,
                status: caption.status,
                flags: caption.bit_flags,
                reportedAsSpam: caption.did_report_as_spam,
                canShare: caption.share_enabled,
                covered: caption.is_covered,
                media: this,
                privateReplyStatus: caption.private_reply_status
            }
        }
        if (typeof data.video_versions !== 'undefined') {
            this.videos = data.video_versions.map(({ width, height, url, type, id }) => ({ width, height, url, type, id }))
        }
        if (typeof data.image_versions2 !== 'undefined') {
            this.images = data.image_versions2.candidates.map(({ width, height, url }) => ({ width, height, url }))
        }
        return this
    }
}
