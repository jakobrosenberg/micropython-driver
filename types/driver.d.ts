import { EventEmitter } from 'events'

export declare class Driver extends EventEmitter {
  isConnected: boolean
  disconnect: () => void
  connect: () => void
  write: (data) => void
  constructor(options: DeviceUrl) {}
}
