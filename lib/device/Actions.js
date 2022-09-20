import { readFileSync } from "fs";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export class Actions {
  /**
   * @param {Device} device
   */
  constructor(device) {
    this.device = device;
  }

  scripts = {
    listdir: readFileSync(`${__dirname}/pyScripts/listdir.py`, "utf-8"),
    listdir_recursive: readFileSync(`${__dirname}/pyScripts/listdir_recursive.py`, "utf-8"),
    mkdir: readFileSync(`${__dirname}/pyScripts/mkdir.py`, "utf-8"),
    mkdir_recursive: readFileSync(`${__dirname}/pyScripts/mkdir_recursive.py`, "utf-8"),
    rmdir: readFileSync(`${__dirname}/pyScripts/rmdir.py`, "utf-8"),
    rmdir_recursive: readFileSync(`${__dirname}/pyScripts/rmdir_recursive.py`, "utf-8"),
  };

  /**
   * @param {string} directory
   * @param {{
   *   recursive?: boolean
   *   includeSha256?: boolean
   * }=} options
   */
  async listFiles(directory, options = {}) {
    const script = options.recursive ? this.scripts.listdir_recursive : this.scripts.listdir;
    const output = await this.device.runScript(`${script}\r\nprint(listdir("${directory}"))`);
    console.log("output", output);
    return JSON.parse(output.replace(/'/g, '"'));
  }

  /**
   * @param {string} directory
   * @param {{
   *   recursive?: boolean
   * }=} options
   */
  async mkdir(directory, options = {}) {
    const script = options.recursive ? this.scripts.mkdir_recursive : this.scripts.mkdir;

    const output = await this.device.runScript(`${script}\r\nprint(mkdir("${directory}"))`);
    return output;
  }

  /**
   * @param {string} filename
   * @param {Buffer|string} data
   * @param {{
   *   checkIfSimilarBeforeUpload?: boolean
   * }=} options
   */
  async putFile(filename, data, options = {}) {
    let dataHex = data.toString("hex");
    this.device.sendData(`import ubinascii; f = open('${filename}', 'wb')`);
    while (dataHex) {
      const chunk = dataHex.slice(0, this.device.chunkSize);
      dataHex = dataHex.slice(this.device.chunkSize);
      this.device.sendData(`f.write(ubinascii.unhexlify("${chunk}"))`);
      if (dataHex) await new Promise((resolve) => setTimeout(resolve, this.device.chunkDelay));
    }
    this.device.sendData("f.close()");
  }

  /**
   * @param {string} filename
   */
  getFileHash(filename) {}

  statPath(path) {}

  getFile(filename) {}

  /**
   * @param {string} directory
   * @param {{
   *   recursive?: boolean
   *   contentOnly?: boolean
   * }=} options
   */
  rmDir(directory, options = {}) {
    const script = options.recursive ? this.scripts.rmdir_recursive : this.scripts.rmdir;
    // return this.device.runScript(`print("hello")`);
    return this.device.runScript(`${script}\r\nrmdir("${directory}", ${options.contentOnly ? 1 : 0})`, {
      emitData: true,
    });
  }
}
