
import { FormData } from './FormData'
import { Headers } from './Headers'

export type RequestSendOptions = {
    url: string
    method?: 'GET' | 'POST'
    headers?: Headers
    data?: FormData
}
