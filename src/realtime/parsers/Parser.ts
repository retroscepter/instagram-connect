
/**
 * Message parser.
 */
export class Parser<T = any> {
    /**
     * Parse a message.
     *
     * @public
     *
     * @param payload Message payload
     *
     * @returns {Promise<T>}
     */
    public async parse (payload: Buffer): Promise<T> {
        throw new Error('parse method must be overidden')
    }
}
