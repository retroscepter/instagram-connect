
export type RequestSendOptions = {
    url: string,
    method?: 'GET' | 'POST',
    headers?: Record<string, string | undefined>
    data?: Record<string, string | undefined>
}
