
import { Entity } from './Entity'
import { DirectThreadItem } from './DirectThreadItem'

export type DirectActionLogData = {
    description: string
    bold: DirectActionLogBoldData[]
    text_attributes: DirectActionLogTextData[]
}

export type DirectActionLogBoldData = {
    start: number
    end: number
}

export type DirectActionLogTextData = {
    start: number
    end: number
    bold: number
    color: string
    intent: string
}

export class DirectActionLog extends Entity {
    public item?: DirectThreadItem

    public description = ''
    public bold: DirectActionLogBoldData[] = []
    public textAttributes: DirectActionLogTextData[] = []

    /**
     * @param item Item this action log belongs to
     * @param data Action log data
     */
    constructor (item: DirectThreadItem, data?: DirectActionLogData) {
        super(item.client)
        if (item) this.item = item
        if (data) this.update(data)
    }

    /**
     * Update state from action log data.
     * 
     * @public
     * 
     * @param data Action log data
     * 
     * @returns {DirectActionLog}
     */
    public update (data: DirectActionLogData): DirectActionLog {
        if (typeof data.description === 'string') this.description = data.description
        if (data.bold) this.bold = data.bold
        if (data.text_attributes) this.textAttributes = data.text_attributes
        return this
    }
}
