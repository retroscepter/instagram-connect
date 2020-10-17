
import { MqttClient, PacketFlowFunc, ConnectResponsePacket, isConnAck, MqttClientConstructorOptions, MqttMessageOutgoing, ConnectRequestOptions } from 'mqtts'

import { ConnectPacket, thriftPacketConfig } from './ConnectPacket'
import { thriftWriteFromObject } from './thrift'
import { compressDeflate } from './util'

const defaultConnectOptions: ConnectRequestOptions = {
    keepAlive: 20,
    protocolLevel: 3,
    connectDelay: 1000 * 60,
    clean: true
}

/**
 * Wrapper around Mqtt for Mqttot protocol.
 */
export class MqttotClient extends MqttClient {
    connectPayload?: Buffer
    requirePayload: boolean = false

    /**
     * @param options Connection options
     */
    constructor (options: MqttClientConstructorOptions) {
        super(options)
        this.state.connectOptions = defaultConnectOptions
    }

    /**
     * Connect request payload data, must be overidden.
     * 
     * @public
     * 
     * @returns {Record<string, unknown>}
     */
    public get connectPayloadData (): Record<string, unknown> {
        throw new SyntaxError('connect payload data must be overidden')
    }

    /**
     * Create initial connection payload.
     * 
     * @private
     * 
     * @returns {Promise<void>}
     */
    private async createConnectPayload (): Promise<void> {
        this.connectPayload = await compressDeflate(thriftWriteFromObject(this.connectPayloadData, thriftPacketConfig))
    }

    /**
     * Connect to Mqtt broker.
     *
     * @public
     * 
     * @returns {Promise<void>}
     */
    public async connect (): Promise<void> {
        await this.createConnectPayload()
        await super.connect()
    }

    /**
     * Publish compressed payload data to a topic.
     *
     * @private
     *
     * @param topic Topic to publish to
     * @param data Compressed payload data
     * @param qos Qos level
     *
     * @returns {Promise<MqttMessageOutgoing}
     */
    public async publishData (topic: string, data: Buffer | Record<string, unknown> | string, qos: 1 | 0 = 1): Promise<MqttMessageOutgoing> {
        return super.publish({
            topic,
            qosLevel: qos,
            payload: data instanceof Buffer ?
                data :
                typeof data === 'object' ?
                Buffer.from(JSON.stringify(data)) :
                Buffer.from(data)
        })
    }

    /**
     * Get connection flow wrapper for Mqtt client.
     * 
     * @protected
     * 
     * @returns {PacketFlowFunc<unknown>}
     */
    protected getConnectFlow (): PacketFlowFunc<unknown> {
        return (success, error) => ({
            start: this.onConnectFlowStart.bind(this),
            accept: this.onConnectFlowAccept.bind(this),
            next: this.onConnectFlowNext(success, error).bind(this)
        })
    }

    /**
     * Connect flow start handler.
     *  
     * @private
     * 
     * @returns {ConnectPacket}
     */
    private onConnectFlowStart (): ConnectPacket {
        const packet = new ConnectPacket(this.connectPayload)
        return packet
    }

    /**
     * Connect flow attempt handler.
     * 
     * @private
     * 
     * @returns {typeof isConnAck}
     */
    private get onConnectFlowAccept (): typeof isConnAck {
        return isConnAck
    }

    /**
     * Connect flow next handler.
     * 
     * @private
     *
     * @param success Success callback
     * @param error Error callback
     * 
     * @returns {(packet: ConnectResponsePacket) => void}
     */
    private onConnectFlowNext (success: unknown, error: unknown): (packet: ConnectResponsePacket) => void {
        return (packet: ConnectResponsePacket) => {
            if (packet.isSuccess) {
                if (packet.payload?.length || !this.requirePayload) {
                    // @ts-expect-error Function isn't typed
                    success(packet)
                } else {
                    // @ts-expect-error Function isn't typed
                    error(new Error('CONNACK: no payload'))
                }
            } else {
                // @ts-expect-error Function isn't typed
                error(new Error('CONNACK: connection error'))
            }
        }
    }
}
