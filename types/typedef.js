/**
 * @typedef {import('../lib/device/DeviceUri').DeviceUrl} DeviceUrl
 * @typedef {import('../lib/device/Device').Device} Device
 *
 * @typedef {Object} DriverProps
 * @prop {function} disconnect
 * @prop {function} connect
 * @prop {(data) => void} write
 * @prop {boolean} isConnected
 *
 * @typedef {typeof import('./driver').Driver} DriverClass
 * @typedef {import('./driver').Driver} Driver
 */
