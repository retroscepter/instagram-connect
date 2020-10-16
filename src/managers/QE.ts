
import { Manager } from './Manager'

import { EXPERIMENTS, LOGIN_EXPERIMENTS } from '../constants/experiments'

/**
 * Manages QE requests
 */
export class QEManager extends Manager {
    /**
     * Sync experiments
     * 
     * @public
     * 
     * @returns {Promise<void>}
     */
    public async syncExperiments (): Promise<void> {
        await this.sync(EXPERIMENTS)
    }

    /**
     * Sync login experiments
     * 
     * @public
     * 
     * @returns {Promise<void>}
     */
    public async syncLoginExperiments (): Promise<void> {
        await this.sync(LOGIN_EXPERIMENTS)
    }

    /**
     * Send sync request with experiment data
     * 
     * @private
     *
     * @param experiments Experiment data
     * 
     * @returns {Promise<void>}
     */
    private async sync (experiments: string): Promise<void> {
        const data = {
            id: this.client.state.uuid,
            experiments
        }

        await this.client.request.send({ url: 'api/v1/qe/sync/', method: 'POST', data })
    }
}
