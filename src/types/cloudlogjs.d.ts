declare module 'cloudlogjs' {
    type Level = 'all' | 'ALL' | 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'TATAL' | 'none'
    type Data = any
    type Upload = (info: unknown, data: Data, level: Level, now: Date | number) => void
    export default class Cloudlog {
        url: string
        level: Level
        mongoUrl: string
        collection: string
        isUpload: boolean
        init: (url: string, mongoUrl: string) => void
        setUpload: (s: boolean) => void
        setCollection: (c: boolean) => void
        setLevel: (l: Level) => void
        upload: Upload
        clog: (info: unknown, data: Data, level: Level, color: string, now: Date | number, upload?: Upload) => void
        trace: (info: unknown, data?: Data, upload?: Upload) => void
        debug: (info: unknown, data?: Data, upload?: Upload) => void
        info: (info: unknown, data?: Data, upload?: Upload) => void
        warn: (info: unknown, data?: Data, upload?: Upload) => void
        error: (info: unknown, data?: Data, upload?: Upload) => void
        fatal: (info: unknown, data?: Data, upload?: Upload) => void
    }
}