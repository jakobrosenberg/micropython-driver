import { EventEmitter } from "events";
import { DeviceInterface } from "../utils/DeviceInterface.js";
import { listenForEventPattern, listenForNextEventPattern } from "../utils/utils.js";
import { createLogger } from "consolite";
import { DeviceUrl } from "./DeviceUri.js";
import { drivers } from "./drivers/drivers.js";

const log = createLogger("[mpd]");

/**
 * @typedef {Object} Options
 * @prop {DeviceUrl|Partial<typeof DeviceUrl['InputOptions']>|string} url
 */

// @ts-ignore
/** @extends DeviceInterface */
export class Device extends EventEmitter {
  /** @type {DeviceInterface['_replMode']} */
  _replMode = "unknown";
  hasRunningScript = false;
  /** @type {DeviceInterface['_rawReplState']} */
  _rawReplState = "receiving";
  _rawReplDataBuffer = [];
  _rawReplErrorBuffer = [];
  _rawReplPendingData = [];
  _isHandlingRawData = false;

  /**
   * @param {Options} options
   */
  constructor(options) {
    super();
    this.options = options;
    this.url = new DeviceUrl(options.url);

    const Driver = drivers[this.url.protocol];
    this.driver = new Driver(this.url, {});
    this.driver.on("data", this.handleProtocolData.bind(this));
    this.detectRepl();
    this.detectRawRepl();
    this.detectPaste();
    this.detectRebooting();
    this.detectSafebooting();
    this.protocolDataHandler();
  }

  get isConnected() {
    return this.driver.isConnected;
  }

  /** @param {DeviceInterface['_replMode']} value */
  set replMode(value) {
    this.emit("replMode", value);
    console.log("[replMode] " + value);
    this._replMode = value;
  }
  get replMode() {
    return this._replMode;
  }
  get rawReplState() {
    return this._rawReplState;
  }
  set rawReplState(value) {
    this.emit("rawReplState", value);
    console.log("[rawReplState] " + value);
    this._rawReplState = value;
  }

  // todo fix race conditions between different detectors. Can't have replMode = "rawRepl" before we run handleProtocolData.
  // This will add r\nraw REPL; CTRL-B to exit\r\n>OK to the data
  // todo we should also be able to handle inlined ctrl+a calls, eg, "some code blah blah\01print(hello)\04\04more code"

  detectRepl() {
    this.readAll(/\r\n>>> $/, 6, () => {
      if (this.replMode === "rawRepl") this.resolveRawRepl(false);
      this.replMode = "repl";
    });
  }

  detectPaste() {
    this.readAll(/^paste mode; Ctrl-C to cancel, Ctrl-D to finish \r\n=== *$/, 24, () => {
      this.replMode = "pasteMode";
    });
  }
  detectRebooting() {}
  detectSafebooting() {
    this.on("write", (data) => {
      if (data.toString() == "\x06") this.replMode = "safebooting";
    });
  }
  rawReplErrorsHandler() {
    this.driver;
  }
  handleProtocolData(data) {
    // console.log("data", data.toString());
    if (this.replMode === "rawRepl") this.handleRawData(data);
    else this.emit("data", data);
  }
  detectRawRepl() {
    this.readAll(/\r\nraw REPL; CTRL-B to exit\r\n>/, 24, () => {
      this.replMode = "rawRepl";
    });
  }
  /**
   * @param {Buffer | Number[]} data
   */
  handleRawData(data) {
    if (this.rawReplState === "receiving") {
      try {
        // the device will emit OK once the code has compiled
        // subsequent data will be from the executed rawRepl code
        const [, dataFromRepl, dataFromRawRepl] = data.toString().match(/(.*)OK(.*)/s);
        console.log("got ok");
        this.emit("data", Buffer.from(dataFromRepl));
        data = Buffer.from(dataFromRawRepl);
        this.rawReplState = "executing";
        this.hasRunningScript = true;
      } catch (err) {
        if (err.message.match("object null is not iterable")) {
          console.log(`[[[[RawRepl expected "OK", but received "${data.toString()}"]]]]`);
          console.log("Replmode unknown");
          this.resolveRawRepl();
          return;
        } else {
          this.emit("error", err);
          throw err;
        }
      }
    }

    this._rawReplPendingData.push(...data);
    if (this._isHandlingRawData) return;
    this._isHandlingRawData = true;

    let byte = null;

    while ((byte = this._rawReplPendingData.shift())) {
      if (byte === 4 && this.rawReplState === "executing") {
        this.rawReplState = "readingErrors";
        this.hasRunningScript = false;
      } else if (byte === 4 && this.rawReplState === "readingErrors") this.resolveRawRepl(true);
      else if (this.rawReplState === "readingErrors") this._rawReplErrorBuffer.push(byte);
      else this._rawReplDataBuffer.push(byte);
    }
    this._isHandlingRawData = false;
  }

  resolveRawRepl(completed) {
    this.emit("rawDataCollected", {
      data: Buffer.from(this._rawReplDataBuffer).toString(),
      error: Buffer.from(this._rawReplErrorBuffer).toString(),
      discarded: Buffer.from(this._rawReplPendingData.splice(0)).toString(),
      completed,
    });
    this._rawReplDataBuffer = [];
    this._rawReplErrorBuffer = [];
    this._rawReplPendingData = [];
    this.rawReplState = "receiving";
  }

  connect() {
    this.driver.on("data", (data) => console.log("@ " + data.toString()));
    return new Promise((resolve, reject) => {
      this.driver.connect();
      this.driver.on("open", resolve);
      this.driver.on("open", () => resolve());
      this.driver.on("open", () => console.log("wtf it opened"));
      this.driver.on("error", reject);
      setTimeout(resolve, 1000);
    });
  }

  disconnect() {
    this.driver.disconnect();
  }

  sendData(data) {
    this.emit("write", data);
    this.driver.write(data);
  }

  /**
   * Enters rawRepl or rawPaste mode. For more info see
   * https://docs.micropython.org/en/latest/reference/repl.html
   */
  async enterRawRepl() {
    if (this.replMode === "rawRepl" || this.replMode === "rawPasteMode") return;
    this.sendData("\x01");
    const replMode = await new Promise((resolve) => this.once("replMode", resolve));
    assert.equal(replMode, "rawRepl");
  }

  async enterRepl() {
    if (this.replMode === "repl") return;
    this.sendData("\x02");
    const replMode = await new Promise((resolve) => this.once("replMode", resolve));
    assert.equal(replMode, "repl");
  }

  /**
   * @param {Buffer | string | RegExp} query
   * @param {number=} length required if query is a RegExp
   * */
  readUntil(query, length) {
    return listenForNextEventPattern(this.driver, "data", query, length);
  }

  /**
   * @param {Buffer | string | RegExp} query
   * @param {number} length required if query is a RegExp
   * @param {((unsub: () => void) => void)} callback
   * */
  readAll(query, length, callback) {
    return listenForEventPattern(this.driver, "data", query, length, callback);
  }

  async runScript(script, options) {
    await this.enterRawRepl();
    this.sendData(script);
  }

  protocolDataHandler() {
    const handleProtocolData = (data) => {
      // console.log("got", data);
    };
    this.driver.on("data", handleProtocolData);
  }
}
