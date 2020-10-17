
import { Parser } from './Parser'

import { unzip, deepParseJson } from '../../util'

/**
 * Iris message parser interface
 *
 * @extends {Parser}
 */
export class IrisParser extends Parser<any> {
    /**
     * Parse iris message payload.
     *
     * @param payload Message payload
     * 
     * @returns {Promise<any>}
     */
    public async parse (payload: Buffer): Promise<any> {
        const unzipped = await unzip(payload)
        const json = unzipped.toString('utf8')
        const data = deepParseJson(json)
        return data
    }
}
