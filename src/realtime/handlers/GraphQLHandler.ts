
import { Handler } from './Handler'

/**
 * GraphQL subscription message handler
 *
 * @extends {Handler}
 */
export class GraphQLHandler extends Handler {
    /**
     * Handle a GraphQL message.
     *
     * @public
     *
     * @param data Message data
     *
     * @returns {Promise<T>}
     */
    public async handle (data: Buffer): Promise<void> {

    }
}
