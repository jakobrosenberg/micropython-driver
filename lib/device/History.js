import _kleur from "kleur";
/** @type {import('kleur')} */
const kleur = _kleur;

const transformCmds = (str) =>
  str
    .replace(/\x01/g, "\\X01")
    .replace(/\x02/g, "\\X02")
    .replace(/\x03/g, "\\X03")
    .replace(/\x04/g, "\\X04")
    .replace(/\x05/g, "\\X05")
    .replace(/\x06/g, "\\X06");

/** @typedef {import('../utils/DeviceInterface').DeviceEventName} DeviceEventName */
/** @typedef {{time: Date, event: DeviceEventName, msg: string}} HistoryItem */

export class History {
  /**
   * @param {import('./Device').Device} device
   */
  constructor(device) {
    this.device = device;
    this.maxItems = 100;
    this.colorize = true;
    this.registerEventListeners();
  }

  registerEventListeners() {
    /** @type {DeviceEventName[]} */
    const events = ["rawData", "write", "error", "replMode", "rawDataCollected", "rawReplState"];
    events.forEach((event) => this.device.on(event, (data) => this.push(event, data)));
  }

  push(event, msg) {
    const item = { time: new Date(), event, msg };
    this.device.emit("all", item);
    this.entries.push(item);
    if (this.entries.length > this.maxItems) this.entries.shift();
  }

  /**
   *
   * @param {number} numLines
   * @param {import('../utils/DeviceInterface').DeviceEventName[]=} filter
   */
  render(numLines = 30, filter) {
    const format = {
      rawData: (entry) => `[${entry.event}] ${kleur.green(transformCmds(entry.msg.toString()))}`,
      write: (entry) => `[${entry.event}] ${kleur.yellow(transformCmds(entry.msg.toString()))}`,
      error: (entry) => `[${entry.event}] ${kleur.red(entry.msg)}`,
      replMode: (entry) => `[${entry.event}] ${kleur.grey(entry.msg)}`,
      rawDataCollected: (entry) => `[${entry.event}] ${kleur.grey(JSON.stringify(entry.msg, null, 2))}`,
      rawReplState: (entry) => `[${entry.event}] ${kleur.grey(entry.msg)}`,
    };

    /** @param {HistoryItem} entry */
    const transformEntry = (entry) => (format[entry.event] || ((x) => `[${x.event}] ${x.msg}`))(entry);

    const entries = this.entries.filter((entry) => (filter ? filter.includes(entry.event) : true)).slice(0, numLines);
    const lines = entries.map(transformEntry);
    return lines.join("\r\n");
  }

  /**
   * @type {HistoryItem[]}
   */
  entries = [];
}
