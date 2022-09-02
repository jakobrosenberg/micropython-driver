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

test("can detect states", async (probs) => {
  const device = new Device({ url: "serial://" + devicePath });
  probs.options.onError = (ctx) => console.log(`<< LOGS FOR ${ctx.scope.join(" > ")} >>\n${device.history.render()}`);

  await device.connect();

  test("can detect safeboot and repl", async (probs) => {
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
    device.sendData("\r\n");
    assert.equal(await replModePromise, "repl");
    assert.equal(device.replMode, "repl");
  });
  test("can detect rawRepl mode", async (context) => {
    await device.enterRawRepl();
    assert.equal(device.replMode, "rawRepl");

    test("can detect rawRepl errors", async (probs) => {
      probs.options.timeout = 3000;
      const rawReplResult = new Promise((resolve) => device.on("rawDataCollected", resolve));
      device.sendData("i will fail\x04");

      assert.deepEqual(await rawReplResult, {
        data: "",
        error:
          "Traceback (most recent call last):\r\n" + '  File "<stdin>", line 1\r\n' + "SyntaxError: invalid syntax\r\n",
        discarded: ">",
        completed: true,
      });
      assert.equal(device.replMode, "rawRepl");
    });
    test("can leave rawRepl", async () => {
      device.sendData("\x02");
      await new Promise((resolve) => device.once("replMode", resolve));
      assert.equal(device.replMode, "repl");
    });
  });
  test("can detect machine.reset in rawRepl", () => {
    test("can enter rawRepl", async () => {
      await device.enterRawRepl();
      assert.equal(device.replMode, "rawRepl");
      assert.equal(device._rawReplState, "receiving");
    });
    test("can detect machine.reset", async (probs) => {
      const rawReplResultPromise = new Promise((resolve) => device.on("rawDataCollected", resolve));
      device.sendData("import machine\nprint('hello')\nmachine.reset()\x04");
      const rawReplResult = await rawReplResultPromise;
      assert.match(rawReplResult.data, /^hello\r\n.+\r\n>>> $/s);
      assert.equal(rawReplResult.error, "");
      assert.equal(rawReplResult.discarded, "");
      assert.equal(rawReplResult.completed, false);
    });
  });
});
