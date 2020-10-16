
import { Response } from 'got'

import { Challenge } from '../entities/Challenge'

export type ClientEvents = {
    ready: () => void
    request: (r: Response) => void

    challenge: (c: Challenge) => void
}
