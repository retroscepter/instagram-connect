
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
     * @param payload Message payload
     * @param payload.event Event name
     * @param payload.data Event data
     *
     * @returns {Promise<T>}
     */
    public async handle ({ event, data }: { event: string, data: any }): Promise<void> {

    }
}
