
import zlib from 'zlib'

export async function compressDeflate (data: string | Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        zlib.deflate(data, { level: 9 }, (error, result) => {
            if (error) reject(error)
            else resolve(result)
        })
    })
}

export async function unzip (data: string | Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        zlib.unzip(data, (error, result) => {
            if (error) reject(error)
            else resolve(result)
        })
    })
}

export async function tryUnzip (data: Buffer): Promise<Buffer> {
    try {
        if (data.readInt8(0) !== 0x78) return data
        return new Promise((resolve, reject) => {
            zlib.unzip(data, (error, result) => {
                if (error) reject(error)
                else resolve(result)
            })
        })
    } catch (e) {
        return data
    }
}

export function tryUnzipSync (data: Buffer): Buffer {
    try {
        if (data.readInt8(0) !== 0x78) return data
        return zlib.unzipSync(data)
    } catch (e) {
        return data
    }
}

export function isJson (buffer: Buffer): RegExpMatchArray | null {
    return String.fromCharCode(buffer[0]).match(/[{[]/)
}
