
import { Parser } from './Parser'

import { ThriftDescriptors, thriftReadToObject } from '../thrift'
import { unzip } from '../../util'

const thriftConfig = [
    ThriftDescriptors.binary('hint', 1)
]

/**
 * Region hint message parser.
 *
 * @extends {Parser}
 */
export class RegionHintParser extends Parser<any> {
    /**
     * Parse region hint message payload.
     *
     * @param payload Message payload
     * 
     * @returns {Promise<any>}
     */
    public async parse (payload: Buffer): Promise<any> {
        const unzipped = await unzip(payload)
        const data = thriftReadToObject(unzipped, thriftConfig)
        return data
    }
}
