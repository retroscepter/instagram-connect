
import LRU from 'lru-cache'

import { Manager } from './Manager'

import { User, UserData, UserFriendshipStatusData } from '../entities/User'

export type UserSearchResponseData = {
    num_results: number
    users: UserSearchResultData[]
}

export type UserInfoResponseData = {
    status: 'ok' | 'fail'
    user?: UserData
}

export type UserSearchResultData = Partial<UserData> & {
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
    account_badges: any[]
    friendship_status: UserFriendshipStatusData
    latest_reel_media: number
}

/**
 * Manages users.
 * 
 * @extends {Manager}
 */
export class UserManager extends Manager {
    /**
     * User cache.
     * 
     * @type {LRU<string, User>}
     */
    public users = new LRU<string, User>()

    /**
     * Search for users by username and return raw response data.
     * 
     * @public
     * 
     * @param username Username
     * @param limit Result limit
     * 
     * @returns {Promise<UserSearchResponseData>}
     */
    public async searchRaw (username: string, limit = 30): Promise<UserSearchResponseData> {
        const data = {
            q: username,
            count: limit
        }

        const response = await this.client.request.send<UserSearchResponseData>({
            url: 'api/v1/users/search/',
            data
        })

        return response.body
    }

    /**
     * Search for users by username.
     * 
     * @public
     * 
     * @param username Username
     * @param limit Result limit
     * 
     * @returns {Promise<User>}
     */
    public async search (username: string, limit = 30): Promise<User[]> {
        const { users } = await this.searchRaw(username, limit)
        return users.map(user => new User(this.client, user))
    }

    /**
     * Get user ID by username.
     * 
     * @public
     * 
     * @param username Username
     * 
     * @returns {Promise<string | undefined>}
     */
    public async getIdByUsername (username: string): Promise<string | undefined> {
        const users = await this.search(username)
        const user = users.find(user => user.username === username)
        return user ? user.id : undefined
    }

    /**
     * Get user info by ID and return raw response data.
     * 
     * @public
     * 
     * @param id User ID
     * 
     * @returns {Promise<UserInfoResponseData>}
     */
    public async getUserRaw (id: string | number): Promise<UserInfoResponseData> {
        const response = await this.client.request.send<UserInfoResponseData>({
            url: `api/v1/users/${id}/info/`
        })

        return response.body
    }

    /**
     * Get user by ID.
     * 
     * @public
     * 
     * @param id User ID
     * 
     * @returns {Promise<User | undefined>}
     */
    public async getUser (id: string | number): Promise<User | undefined> {
        const { user } = await this.getUserRaw(id)
        return user ? new User(this.client, user) : undefined
    }

    /**
     * Create or update user in user cache.
     * 
     * @public
     * 
     * @param data User data
     * 
     * @returns {User}
     */
    public upsertUser (data: Partial<UserData>): User {
        const id = BigInt(data.pk).toString()
        const user = this.users.get(id)
        if (user) {
            return user.update(data)
        } else {
            const newUser = new User(this.client, data)
            this.users.set(id, newUser)
            return newUser
        }
    }
}
