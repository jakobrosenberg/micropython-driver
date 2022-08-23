import { Telnet } from "telnet-client";
import { BaseDriver } from "./BaseDriver.js";

const events = ["close", "data", "end", "error", "pause", "resume", "open"];

/** @implements {DriverProps} */
export class TelnetDriver extends BaseDriver {
  constructor(url) {
    super(url);
    this.adapter = new Telnet();
    events.forEach((event) =>
      this.adapter.on(event, (...payload) => {
        // console.log("proxying", event, ...payload);
        this.emit(event, ...payload);
      })
    );
  }

  disconnect() {}

  connect() {
    const params = {
      host: "192.168.0.188",
      port: 23,
      shellPrompt: "/ # ", // or negotiationMandatory: false
      timeout: 1500,
    };
    this.adapter.connect(params);
  }

  // get isConnected() {  }

  write(chunk, encoding) {}
}
