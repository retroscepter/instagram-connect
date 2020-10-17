
import { Parser } from './Parser'

import { ThriftDescriptors, thriftReadToObject } from '../thrift'
import { unzip, deepParseJson } from '../../util'

const thriftConfig = [
    ThriftDescriptors.int32('topic', 1),
    ThriftDescriptors.binary('payload', 2)
]

/**
 * Skywalker subscription message parser
 *
 * @extends {Parser}
 */
export class SkywalkerParser extends Parser<any> {
    /**
     * Parse Skywalker message payload.
     *
     * @param payload Message payload
     * 
     * @returns {Promise<any>}
     */
    public async parse (payload: Buffer): Promise<any> {
        const unzipped = await unzip(payload)
        const data = thriftReadToObject(unzipped, thriftConfig)
        return deepParseJson(data)
    }
}
