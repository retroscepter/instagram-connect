
import { Chance } from 'chance'

import { Manager } from './Manager'

export type PhotoUploadOptions = {
    file: Buffer,
    id?: string
    sidecar?: boolean
}

export type PhotoRuploadParams = {
    media_type: string
    upload_id: string
    xsharing_user_ids: string
    image_compression: string
    retry_context: string
    is_sidecar?: string
}

export type PhotoUploadResponseData = {
    status: 'ok' | 'fail'
    upload_id: string
    message?: string
}

export type VideoUploadOptions = {
    file: Buffer
    id?: string
    duration: number
    width?: number
    height?: number
    sidecar?: boolean
    album?: boolean
    direct?: boolean
    directStory?: boolean
    igtv?: boolean
    voice?: boolean
}

export type VideoRuploadParams = {
    media_type: string
    upload_id: string
    upload_media_width?: string
    upload_media_height?: string
    upload_media_duration_ms: string
    xsharing_user_ids: string
    retry_context: string
    is_sidecar?: string
    for_album?: string
    direct_v2?: string
    for_direct_story?: string
    content_tags?: string
    is_igtv_video?: string
    is_direct_voice?: string
}

export type VideoUploadResponseData = {
    status: 'ok' | 'fail'
    message?: string
}

/**
 * Manages uploads.
 * 
 * @extends {Manager}
 */
export class UploadManager extends Manager {
    /**
     * Upload a photo.
     * 
     * @public
     * 
     * @param options Upload options
     * 
     * @returns {Promise<PhotoUploadResponseData>}
     */
    public async photo (options: PhotoUploadOptions): Promise<PhotoUploadResponseData> {
        const uploadId = options.id || Date.now().toString()
        const uploadName = `${uploadId}_0_${Math.floor(Math.random() * 8999999999) + 1000000000}`
        const ruploadParams = JSON.stringify(this.createPhotoRuploadParams(options, uploadId))
        const waterfallId = new Chance().guid({ version: 4 })
        const contentLength = options.file.byteLength.toString()

        const headers = {
            'Offset': '0',
            'X_FB_PHOTO_WATERFALL_ID': waterfallId,
            'X-Instagram-Rupload-Params': ruploadParams,
            'X-Entity-Type': 'image/jpeg',
            'X-Entity-Name': uploadName,
            'X-Entity-Length': contentLength,
            'Content-Type': 'application/octet-stream',
            'Content-Length': contentLength,
            'Accept-Encoding': 'gzip'
        }

        const response = await this.client.request.send<PhotoUploadResponseData>({
            url: `rupload_igphoto/${uploadName}`,
            method: 'POST',
            headers,
            body: options.file
        })

        return response.body
    }

    /**
     * Create rupload photo params.
     * 
     * @public
     * 
     * @param options Photo upload options
     * @param uploadId Upload ID
     * 
     * @returns {PhotoRuploadParams}
     */
    public createPhotoRuploadParams (options: PhotoUploadOptions, uploadId: string | number): PhotoRuploadParams {
        return {
            media_type: '1',
            upload_id: uploadId.toString(),
            xsharing_user_ids: JSON.stringify([]),
            image_compression: JSON.stringify({ lib_name: 'moz', lib_version: '3.1.m', quality: '80' }),
            retry_context: JSON.stringify({ num_step_auto_retry: 0, num_reupload: 0, num_step_manual_retry: 0 }),
            is_sidecar: options.sidecar ? '1' : undefined
        }
    }

    /**
     * Upload a video.
     * 
     * @public
     * 
     * @param options Video upload options
     * 
     * @returns {Promise<VideoUploadResponseData>}
     */
    public async video (options: VideoUploadOptions): Promise<VideoUploadResponseData> {
        const uploadId = options.id || Date.now().toString()
        const uploadName = `${uploadId}_0_${Math.floor(Math.random() * 8999999999) + 1000000000}`
        const ruploadParams = JSON.stringify(this.createVideoRuploadParams(options, uploadId))
        const waterfallId = new Chance().guid({ version: 4 })
        const contentLength = options.file.byteLength.toString()

        const headers = {
            'Offset': '0',
            'X_FB_PHOTO_WATERFALL_ID': waterfallId,
            'X-Instagram-Rupload-Params': ruploadParams,
            'X-Entity-Type': 'video/mp4',
            'X-Entity-Name': uploadName,
            'X-Entity-Length': contentLength,
            'Content-Type': 'application/octet-stream',
            'Content-Length': contentLength,
            'Accept-Encoding': 'gzip'
        }

        const response = await this.client.request.send<VideoUploadResponseData>({
            url: `rupload_igvideo/${uploadName}`,
            method: 'POST',
            headers,
            body: options.file
        })

        return response.body
    }

    /**
     * Create rupload video params.
     * 
     * @public
     * 
     * @param options Video upload options
     * @param uploadId Upload ID
     * 
     * @returns {VideoRuploadParams}
     */
    public createVideoRuploadParams (options: VideoUploadOptions, uploadId: string): VideoRuploadParams {
        return {
            media_type: '2',
            upload_id: uploadId.toString(),
            upload_media_width: options.width?.toString(),
            upload_media_height: options.height?.toString(),
            upload_media_duration_ms: options.duration.toString(),
            xsharing_user_ids: JSON.stringify([]),
            retry_context: JSON.stringify({ num_step_auto_retry: 0, num_reupload: 0, num_step_manual_retry: 0 }),
            is_sidecar: options.sidecar ? '1' : undefined,
            for_album: options.album ? '1' : undefined,
            direct_v2: options.direct ? '1' : undefined,
            for_direct_story: options.directStory ? '1' : undefined,
            content_tags: options.directStory ? '' : undefined,
            is_igtv_video: options.igtv ? '1' : undefined,
            is_direct_voice: options.voice ? '1' : undefined
        }
    }
}
