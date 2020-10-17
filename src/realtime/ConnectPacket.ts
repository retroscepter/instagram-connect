
import { InvalidDirectionError, MqttPacket, PacketStream, PacketTypes } from 'mqtts'

import { ThriftDescriptors, ThriftPacketDescriptor } from './thrift'

export class ConnectPacket extends MqttPacket {
    public get protocolName (): string {
        return this._protocolName
    }

    public set protocolName (value: string) {
        this.assertValidStringLength(value)
        this._protocolName = value
    }

    public get keepAlive (): number {
        return this._keepAlive
    }

    public set keepAlive (value: number) {
        if (value > 0xffff) {
            throw new TypeError('KeepAlive was greater than 0xffff')
        }
        this._keepAlive = value
    }

    public get flags (): number {
        return this._flags
    }

    public set flags (value: number) {
        if (value > 0xff) {
            throw new TypeError('Flags were greater than 0xff')
        }
        this._flags = value;
    }

    private protocolLevel = 3
    private _protocolName = 'MQTToT'
    private _flags = 194
    private _keepAlive = 60
    public payload: Buffer

    public constructor (payload?: Buffer) {
        super(PacketTypes.TYPE_CONNECT)
        this.payload = payload ?? Buffer.from([])
    }

    public read (): void {
        throw new InvalidDirectionError('read')
    }

    public write (stream: PacketStream): void {
        const data = PacketStream.empty()
            .writeString(this._protocolName)
            .writeByte(this.protocolLevel)
            .writeByte(this._flags)
            .writeWord(this._keepAlive)
            .write(this.payload)

        this.remainingPacketLength = data.length
        super.write(stream)
        stream.write(data.data)
    }
}

export const thriftPacketConfig: ThriftPacketDescriptor[] = [
    ThriftDescriptors.binary('clientIdentifier', 1),
    ThriftDescriptors.binary('willTopic', 2),
    ThriftDescriptors.binary('willMessage', 3),
    ThriftDescriptors.struct('clientInfo', 4, [
        ThriftDescriptors.int64('userId', 1),
        ThriftDescriptors.binary('userAgent', 2),
        ThriftDescriptors.int64('clientCapabilities', 3),
        ThriftDescriptors.int64('endpointCapabilities', 4),
        ThriftDescriptors.int32('publishFormat', 5),
        ThriftDescriptors.boolean('noAutomaticForeground', 6),
        ThriftDescriptors.boolean('makeUserAvailableInForeground', 7),
        ThriftDescriptors.binary('deviceId', 8),
        ThriftDescriptors.boolean('isInitiallyForeground', 9),
        ThriftDescriptors.int32('networkType', 10),
        ThriftDescriptors.int32('networkSubtype', 11),
        ThriftDescriptors.int64('clientMqttSessionId', 12),
        ThriftDescriptors.binary('clientIpAddress', 13),
        ThriftDescriptors.listOfInt32('subscribeTopics', 14),
        ThriftDescriptors.binary('clientType', 15),
        ThriftDescriptors.int64('appId', 16),
        ThriftDescriptors.boolean('overrideNectarLogging', 17),
        ThriftDescriptors.binary('connectTokenHash', 18),
        ThriftDescriptors.binary('regionPreference', 19),
        ThriftDescriptors.binary('deviceSecret', 20),
        ThriftDescriptors.byte('clientStack', 21),
        ThriftDescriptors.int64('fbnsConnectionKey', 22),
        ThriftDescriptors.binary('fbnsConnectionSecret', 23),
        ThriftDescriptors.binary('fbnsDeviceId', 24),
        ThriftDescriptors.binary('fbnsDeviceSecret', 25),
        ThriftDescriptors.int64('anotherUnknown', 26),
    ]),
    ThriftDescriptors.binary('password', 5),
    ThriftDescriptors.int16('unknown', 5),
    ThriftDescriptors.listOfBinary('getDiffsRequests', 6),
    ThriftDescriptors.binary('zeroRatingTokenHash', 9),
    ThriftDescriptors.mapBinaryBinary('appSpecificInfo', 10),
]
