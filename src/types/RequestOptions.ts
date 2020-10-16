
import { FormData } from './FormData'
import { Headers } from './Headers'

export type RequestOptions = {
    url: string
    method?: 'GET' | 'POST'
    headers?: Headers
    data?: FormData
}
