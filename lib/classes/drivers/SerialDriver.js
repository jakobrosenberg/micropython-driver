import { SerialPort } from "serialport";
import { BaseDriver } from "./BaseDriver.js";

const events = ["close", "data", "end", "error", "pause", "resume", "open"];

/** @implements {Driver} */
export class SerialDriver extends BaseDriver {
  constructor(url) {
    super(url);
    console.log("connecting to path", url.path);
    this.adapter = new SerialPort({ path: url.path, baudRate: 115200, autoOpen: false });

    this.adapter.on("open", () => {
      // console.log("is open");
      if (process.platform === "win32") {
        this.adapter.set({ dtr: true, rts: true });
      }
      this.adapter.write("\r\n");
    });

    events.forEach((event) =>
      this.adapter.on(event, (...payload) => {
        // console.log("proxying", event, ...payload);
        this.emit(event, ...payload);
      })
    );

    this.adapter.on("data", (data) => console.log(data.toString()));
  }

  connect() {
    return new Promise((resolve, reject) => this.adapter.open((error) => (error ? reject(error) : resolve())));
  }

  disconnect() {
    return new Promise((resolve, reject) => {
      this.adapter.close((error) => {
        if (error) reject(error);
        resolve();
      });
    });
  }

  get isConnected() {
    return this.adapter.isOpen;
  }

  write(chunk, encoding) {
    console.log("writing", chunk);

    this.adapter.write(chunk);
  }
}
