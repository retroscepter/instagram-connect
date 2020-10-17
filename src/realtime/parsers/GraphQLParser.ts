
import { Parser } from './Parser'

import { thriftRead } from '../thrift'
import { unzip, deepParseJson } from '../../util'

/**
 * GraphQL subscription message parser
 *
 * @extends {Parser}
 */
export class GraphQLParser extends Parser<any> {
    /**
     * Parse GraphQL message payload.
     *
     * @param payload Message payload
     * 
     * @returns {Promise<any>}
     */
    public async parse (payload: Buffer) {
        const unzipped = await unzip(payload)
        const thriftMessage = thriftRead(unzipped)
        const event = thriftMessage[0].value
        const data = deepParseJson(thriftMessage[1].value)
        return { event, data }
    }
}
