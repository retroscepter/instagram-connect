
import LRU from 'lru-cache'

import { Manager } from './Manager'

import { User, UserData, UserFriendshipStatusData } from '../entities/User'

export type UserSearchData = {
    num_results: number
    users: UserSearchResultData[]
}

export type UserInfoData = {
    status: 'ok' | 'fail'
    user: UserData
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
    users = new LRU<string, User>()

    public async searchRaw (username: string, limit: number = 30): Promise<UserSearchResultData[]> {
        const data = {
            q: username,
            count: limit
        }

        const { body } = await this.client.request.send<UserSearchData>({
            url: 'api/v1/users/search/',
            data
        })

        return body.users
    }

    public async search (username: string, limit: number = 30): Promise<User[]> {
        const users = await this.searchRaw(username, limit)
        return users.map(user => new User(this.client, user))
    }

    public async getIdByUsername (username: string): Promise<string | undefined> {
        const users = await this.search(username)
        const user = users.find(user => user.username === username)
        return user ? user.id : undefined
    }

    public async getUserRaw (id: string | number): Promise<UserData | undefined> {
        const { body } = await this.client.request.send<UserInfoData>({
            url: `api/v1/users/${id}/info/`
        })

        return body.user
    }

    public async getUser (id: string | number): Promise<User | undefined> {
        const user = await this.getUserRaw(id)
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
