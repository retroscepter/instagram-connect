
import { Entity } from './Entity'

import { Client } from '../Client'

export type UserData = {
    pk: number
    username: string
    full_name: string
    is_private: boolean
    profile_pic_url: string
    profile_pic_id: string
    is_verified: boolean
    has_anonymous_profile_picture: boolean
    mutual_followers_count: number
    allowed_commenter_type: string
    latest_reel_media: number
    friendship_status?: UserFriendshipStatusData
    follower_count: number
    following_count: number
    following_tag_count: number
    biography?: string
    external_url?: string
    external_lynx_url?: string
    total_igtv_videos: number
    has_igtv_series: boolean
    total_clips_count: number
    total_ar_effects: number
    usertags_count: number
    is_favorite: boolean
    is_favorite_for_stories: boolean
    is_favorite_for_igtv: boolean
    is_favorite_for_highlights: boolean
    live_subscription_status: string
    is_interest_account: boolean
    has_chaining: boolean
    hd_profile_pic_url_info: UserHDProfilePicInfoData
    profile_context: string,
    profile_context_mutual_follow_ids: string[]
    show_stoppable_feed: boolean
    shoppable_posts_count: number
    can_be_reported_as_fraud: boolean
    merchant_checkout_style: string
    seller_shoppable_feed_type: string
    has_hightlight_reels: boolean
    has_guides: boolean
    is_eligible_for_smb_support_follow: boolean
    displayed_action_button_partner?: any
    smb_donation_partner?: string
    smd_delivery_partner?: string
    smd_support_partner?: string
    smd_support_delivery_partner?: string
    displayed_action_button_type: string
    direct_messaging: string
    address_street: string
    business_contact_method: string
    category?: string
    city_id: number
    city_name: string
    contact_phone_number: string
    is_call_to_action_enabled: boolean
    latitude: number
    longitude: number
    public_email: string
    public_phone_country_code: string
    public_phone_number: string
    zip: string
    instagram_location_id: string
    is_business: boolean
    account_type: number
    professional_conversion_suggested_account_type: number
    can_hide_category: boolean
    can_hide_public_contacts: boolean
    should_show_category: boolean
    should_show_public_contacts: boolean
    account_badges: any[]
    whatsapp_number: string
    include_direct_blacklist_status: boolean
    is_potential_business: boolean
    show_post_insights_entry_point: boolean
    is_bestie: boolean
    has_unseen_besties_media: boolean
    show_account_transparency_details: boolean
    auto_expand_chaining: boolean
    highlight_reshare_disabled: boolean
    is_memorialized: boolean
    open_external_url_with_in_app_browser: true
}

export type UserHDProfilePicInfoData = {
    url: string
    width: number
    height: number
}

export type UserFriendshipStatusData = {
    following: boolean
    is_private: boolean
    incoming_request: boolean
    outgoing_request: boolean
    is_bestie: boolean
    is_restricted: boolean
}

/**
 * Represents a user.
 * 
 * @extends {Entity}
 */
export class User extends Entity {
    public id: string = ''
    public username: string = ''
    public name: string = ''
    public isPrivate: boolean = false
    public profilePicUrl?: string
    public profilePicId?: string
    public isVerified?: boolean = false
    public anonymousProfilePic: boolean = false
    public mutualFollowerCount?: number
    public isFollowing?: boolean
    public incomingFollowRequest?: boolean
    public outgoingFollowRequest?: boolean
    public isBestie?: boolean
    public isRestricted?: boolean
    public followerCount?: number
    public followingCount?: number
    public followingTagCount?: number
    public biography?: string
    public externalUrl?: string
    public externalLynxUrl?: string
    public igtvVideoCount?: number
    public hasIGTVSeries?: boolean
    public clipsCount?: number
    public arEffectCount?: number
    public usertagCount?: number
    public isFavorite?: boolean
    public isFavoriteStories?: boolean
    public isFavoriteIGTV?: boolean
    public isFavoriteHighlights?: boolean
    public liveSubscriptionStatus?: string
    public isInterestAccount?: boolean
    public chaining?: boolean
    public hdProfilePicUrl?: string
    public hdProfilePicWidth?: number
    public hdProfilePicHeight?: number
    public profileContext?: string
    public mutualFollowerIds?: string[]
    public shoppablePostCount?: number
    public canBeReported?: boolean
    public merchantCheckoutStyle?: string
    public shoppableFeedStyle?: string
    public hasHightlightReels?: boolean
    public hasGuides?: boolean
    public streetAddress?: string
    public contactMethod?: string
    public category?: string
    public cityId?: number
    public city?: string
    public contactPhoneNumber?: string
    public hasCallToAction?: boolean
    public latitude?: number
    public longitude?: number
    public publicEmail?: string
    public publicPhoneCountryCode?: string
    public publicPhoneNumber?: string
    public zipCode?: string
    public locationId?: string
    public business?: boolean
    public type?: number
    public canHideCategory?: boolean
    public canHidePublicContacts?: boolean
    public shouldShowCategory?: boolean
    public shouldShowPublicContacts?: boolean
    public whatsAppNumber?: string
    public potentialBusiness?: boolean
    public unseenBestieStory?: boolean
    public showAccountTransparencyDetails?: boolean
    public autoExpandChaining?: boolean
    public highlightShareDisabled?: boolean
    public memorialized?: boolean

    /**
     * @param client Client managing this user
     * @param data User data
     */
    constructor (client: Client, data: Partial<UserData>) {
        super(client)
        this.update(data)
    }

    /**
     * Get user info and update state.
     * 
     * @public
     * 
     * @returns {Promise<User>}
     */
    public async getMore (): Promise<User> {
        const user = await this.client.users.getUserRaw(this.id)
        if (user) this.update(user)
        return this
    }

    /**
     * Update state from user data
     * 
     * @public
     * 
     * @param data User data
     * 
     * @returns {User}
     */
    public update (data: Partial<UserData>): User {
        if (typeof data.pk === 'number') this.id = BigInt(data.pk).toString()
        if (typeof data.username === 'string') this.username = data.username
        if (typeof data.full_name === 'string') this.name = data.full_name
        if (typeof data.is_private === 'boolean') this.isPrivate = data.is_private
        if (typeof data.profile_pic_url === 'string') this.profilePicUrl = data.profile_pic_url
        if (typeof data.profile_pic_id === 'string') this.profilePicId = data.profile_pic_id
        if (typeof data.is_verified === 'boolean') this.isVerified = data.is_verified
        if (typeof data.has_anonymous_profile_picture === 'boolean') this.anonymousProfilePic = data.has_anonymous_profile_picture
        if (typeof data.mutual_followers_count === 'number') this.mutualFollowerCount = data.mutual_followers_count
        if (data.friendship_status) {
            this.isFollowing = data.friendship_status.following
            this.incomingFollowRequest = data.friendship_status.incoming_request
            this.outgoingFollowRequest = data.friendship_status.outgoing_request
            this.isRestricted = data.friendship_status.is_restricted
        }
        if (typeof data.follower_count === 'number') this.followerCount = data.follower_count
        if (typeof data.following_count === 'number') this.followingCount = data.following_count
        if (typeof data.following_tag_count === 'number') this.followingTagCount = data.following_tag_count
        if (typeof data.biography === 'string') this.biography = data.biography
        if (typeof data.external_url === 'string') this.externalUrl = data.external_url
        if (typeof data.external_lynx_url === 'string') this.externalLynxUrl = data.external_lynx_url
        if (typeof data.total_igtv_videos === 'number') this.igtvVideoCount = data.total_igtv_videos
        if (typeof data.has_igtv_series === 'boolean') this.hasIGTVSeries = data.has_igtv_series
        if (typeof data.total_clips_count === 'number') this.clipsCount = data.total_clips_count
        if (typeof data.total_ar_effects === 'number') this.arEffectCount = data.total_ar_effects
        if (typeof data.usertags_count === 'number') this.usertagCount = data.usertags_count
        if (typeof data.is_favorite === 'boolean') this.isFavorite = data.is_favorite
        if (typeof data.is_favorite_for_stories === 'boolean') this.isFavoriteStories = data.is_favorite_for_stories
        if (typeof data.is_favorite_for_igtv === 'boolean') this.isFavoriteIGTV = data.is_favorite_for_igtv
        if (typeof data.is_favorite_for_highlights === 'boolean') this.isFavoriteHighlights = data.is_favorite_for_highlights
        if (typeof data.live_subscription_status === 'string') this.liveSubscriptionStatus = data.live_subscription_status
        if (typeof data.has_chaining === 'boolean') this.chaining = data.has_chaining
        if (data.hd_profile_pic_url_info) {
            this.hdProfilePicUrl = data.hd_profile_pic_url_info.url
            this.hdProfilePicWidth = data.hd_profile_pic_url_info.width
            this.hdProfilePicHeight = data.hd_profile_pic_url_info.height
        }
        return this
    }
}
