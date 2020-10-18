
export interface DirectInboxData {
    inbox: DirectInboxInboxData
    seq_id: number
    snapshot_at_ms: number
    pending_requests_total: number
    has_pending_top_requests: boolean
    status: 'ok' | 'failed'
}

export interface DirectInboxInboxData {
    threads: any[]
    has_older: boolean
    unseen_count: number
    unseen_count_ts: number
    oldest_cursor: string
    prev_cursor: DirectInboxCursorData
    next_cursor: DirectInboxCursorData
    blended_inbox_enabled: boolean
}

export interface DirectInboxCursorData {
    cursor_timestamp_seconds: number
    cursor_thread_v2_id: number
}
