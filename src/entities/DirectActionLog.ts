
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

    public description: string = ''
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
        if (typeof data.bold !== 'undefined') this.bold = data.bold
        if (typeof data.text_attributes !== 'undefined') this.textAttributes = data.text_attributes
        return this
    }
}
