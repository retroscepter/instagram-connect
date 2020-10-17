
import { unzip } from '../util'

export class IrisParser {
    public async parse (payload: Buffer) {
        const unzipped = await unzip(payload)
        const json = unzipped.toString('utf8')
        const data = JSON.parse(json)
        return data
    }
}
