import { Device, listDevices } from "../lib/index.js";
import { getException } from "./utils.js";

let devicePath = "";
beforeAll(async () => {
  const devices = await listDevices();
  devicePath = devices[0].path;
});

// const largeScript = "value = " + Array(10000).fill(" 1 ").join("+") + "\nprint('value is')\nprint(value)";
// const largeScript = "value = '" + "".padEnd(10000, "0") + "'\nprint('value is')\nprint(value)";
const largeScript = "value = '" + "".padEnd(100, "0") + "'\nprint('value is')\nprint(value)";

test("can detect states", async () => {
  const device = new Device({ url: "serial://" + devicePath });
  await device.connect();

  test("can detect safeboot and repl", async (probs) => {
    probs.timeout = 3000;
    assert(device.replMode !== "safebooting");
    const replModePromise = new Promise((resolve) => device.once("replMode", resolve));
    device.sendData("\x06");
    assert.equal(await replModePromise, "safebooting");
    const nextReplMode = await new Promise((resolve) => device.once("replMode", resolve));
    assert.equal(nextReplMode, "repl");
  });
  test("can detect repl", async () => {
    device._replMode = "unknown";
    const replModePromise = new Promise((resolve) => device.once("replMode", resolve));
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("send line change");
    device.sendData("\r\n");
    assert.equal(await replModePromise, "repl");
    assert.equal(device.replMode, "repl");
  });
  test("can detect rawRepl mode", async (context) => {
    await device.enterRawRepl();
    assert.equal(device.replMode, "rawRepl");

    test("can detect rawRepl errors", async (probs) => {
      probs.timeout = 3000;
      const rawReplResult = new Promise((resolve) => device.on("rawDataCollected", resolve));
      device.sendData("i will fail\x04");
      const result = await new Promise((resolve) => device.driver.once("data", resolve));
      console.log("result");
      console.log(result.toString());
      console.log("rawReplResult", await rawReplResult);
    });
  });

  // test("can detect rawRepl errors mode", () => {});
  // test("can detect paste mode", () => {});

  // test("can detect machine.reset()", () => {});
});
