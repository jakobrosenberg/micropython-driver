import { Device, listDevices } from "../lib/index.js";
import { getException } from "./utils.js";

let devicePath = "";
beforeAll(async () => {
  const devices = await listDevices();
  devicePath = devices[0].path;
});

// const largeScript = "value = " + Array(10000).fill(" 1 ").join("+") + "\nprint('value is')\nprint(value)";
// const largeScript = "value = '" + "".padEnd(10000, "0") + "'\nprint('value is')\nprint(value)";
const largeScript = "value = '" + "".padEnd(100, "0") + "'\r\nprint('done')";

test("chunking suite", async (probs) => {
  const device = new Device({ url: "serial://" + devicePath });
  probs.options.onError = (ctx) => console.log(`<< LOGS FOR ${ctx.scope.join(" > ")} >>\n${device.history.render()}`);
  await device.connect();

  test("send chunks large files", async (probs) => {
    const chunkSizeBak = device.chunkSize;
    const chunkDelayBak = device.chunkDelay;
    device.chunkSize = 20;
    device.chunkDelay = 10;

    await device.enterRawRepl();
    assert.equal(device.replMode, "rawRepl");
    const dataPromise = new Promise((resolve) => device.once("rawDataCollected", resolve));
    device.sendData(largeScript + "\x04");
    await dataPromise;
    const writes = device.history.entries
      .filter((entry) => entry.event === "write")
      .map((entry) => entry.msg.toString());

    device.chunkSize = chunkSizeBak;
    device.chunkDelay = chunkDelayBak;

    assert.deepEqual(writes, [
      "\x01",
      "value = '00000000000",
      "00000000000000000000",
      "00000000000000000000",
      "00000000000000000000",
      "00000000000000000000",
      "000000000'\r\nprint('d",
      "one')\x04",
    ]);
  });
});
