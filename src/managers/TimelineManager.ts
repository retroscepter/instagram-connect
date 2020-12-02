
import { Manager } from './Manager'

import { Media, MediaData } from '../entities/Media'

export type TimelineManagerGetReason =
    'pagination' |
    'pull_to_refresh' |
    'warm_start_fetch' |
    'cold_start_fetch'

export type TimelineManagerGetOptions = {
    reason?: TimelineManagerGetReason
    pullToRefresh?: boolean
    recoveredFromCrash?: boolean
    pushDisabled?: boolean
    nextMaxId?: string
}

export type TimelineResponseData = {
    num_results: number
    more_available: boolean
    auto_load_more_enabled: boolean
    feed_items: TimelineItemData[]
    is_direct_v2_enabled: boolean
    next_max_id?: string
    view_state_version: string
    client_feed_changelist_applied: boolean
    feed_pill_text?: string
    request_id: string
    pull_to_refresh_window_ms: number
    preload_distance: number
    status: 'ok' | 'fail'
}

export type TimelineItemData = {
    media_or_ad: MediaData
    end_of_feed_demarcator?: unknown
}

/**
 * Manages the timeline.
 * 
 * @extends {Manager}
 */
export class TimelineManager extends Manager {
    /**
     * If more posts are available.
     * 
     * @type {boolean}
     */
    public more?: boolean

    /**
     * Next cursor ID for pagination.
     * 
     * @type {string}
     */
    public nextMaxId?: string

    /**
     * Get posts from the timeline and return the raw response data.
     * 
     * @public
     * 
     * @param options Timeline options
     * 
     * @returns {Promise<TimelineResponseData>}
     */
    public async getRaw (options?: TimelineManagerGetOptions): Promise<TimelineResponseData> {
        const data = {
            is_prefetch: '0',
            feed_view_info: '',
            seen_posts: '',
            phone_id: this.client.state.phoneId,
            is_pull_to_refresh: (options?.pullToRefresh || options?.reason === 'pull_to_refresh') ? '1' : '0',
            client_session_id: this.client.state.clientSessionId,
            device_id: this.client.state.uuid,
            _uuid: this.client.state.uuid,
            is_charging: 1,
            is_async_ads_in_headload_enabled: 0,
            rti_delivery_backend: 0,
            is_async_ads_double_request: 0,
            will_sound_on: 0,
            is_async_ads_rti: 0,
            recovered_from_crash: options?.recoveredFromCrash,
            push_disabled: options?.pushDisabled,
            reason: options?.nextMaxId ? 'pagination' : options?.reason,
            max_id: options?.nextMaxId
        }

        const response = await this.client.request.send<TimelineResponseData>({
            url: 'api/v1/feed/timeline/',
            method: 'POST',
            data
        })

        this.more = response.body.more_available
        this.nextMaxId = response.body.next_max_id

        return response.body
    }

    /**
     * Get posts from the timeline.
     * 
     * @public
     * 
     * @param options Timeline options
     * 
     * @returns {Promise<Media[]>}
     */
    public async get (options?: TimelineManagerGetOptions): Promise<Media[]> {
        const body = await this.getRaw(options)
        return body.feed_items
            .filter(i => i.media_or_ad)
            .map(i => new Media(this.client, i.media_or_ad))
    }

    /**
     * Gets the posts from the next page of the timeline and return the raw response data.
     * 
     * @public
     * 
     * @param options Timeline options
     * 
     * @returns {Promise<TimelineResponseData>}
     */
    public async nextRaw (options?: TimelineManagerGetOptions): Promise<TimelineResponseData> {
        return this.getRaw({
            ...(options || {}),
            pullToRefresh: false,
            nextMaxId: this.nextMaxId
        })
    }

    /**
     * Gets the posts from the next page of the timeline.
     * 
     * @public
     * 
     * @param options Timeline options
     * 
     * @returns {Promise<Media[]>}
     */
    public async next (options?: TimelineManagerGetOptions): Promise<Media[]> {
        return this.get({
            ...(options || {}),
            pullToRefresh: false,
            nextMaxId: this.nextMaxId
        })
    }
}
