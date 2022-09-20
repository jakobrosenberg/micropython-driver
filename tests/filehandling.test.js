import { Device, listDevices } from "../lib/index.js";
import { getException } from "./utils.js";

let devicePath = "";
beforeAll(async () => {
  const devices = await listDevices();
  devicePath = devices[0].path;
});

test("filehandling", async (probs) => {
  const device = new Device({ url: "serial://" + devicePath });
  probs.options.onError = (ctx) => console.log(`<< LOGS FOR ${ctx.scope.join(" > ")} >>\n${device.history.render()}`);

  await device.connect();

  test("can erase device", async (probs) => {
    // probs.options.timeout = 6000;
    await device.actions.rmDir("/flash", { recursive: true, contentOnly: true });
    const files = await device.actions.listFiles("/flash");
    assert.deepEqual(files, []);
  });

  test("can create dir", async (probs) => {
    await device.actions.mkdir("/flash/a_dir");
    const files = await device.actions.listFiles("/flash");
    assert.deepEqual(files, ["a_dir"]);
  });

  test("can create nested dir", async (probs) => {
    await device.actions.mkdir("/flash/a_dir/nested_dir");
    const result = await device.actions.listFiles("/flash", { recursive: true });
    assert.deepEqual(result, ["/flash/a_dir/nested_dir"]);
  });

  test("can create dir recursively", async (probs) => {
    await device.actions.mkdir("/flash/another_dir/nested_dir", { recursive: true });
    const result = await device.actions.listFiles("/flash", { recursive: true });
    assert.deepEqual(result, ["/flash/a_dir/nested_dir", "/flash/another_dir/nested_dir"]);
  });

  test("can put file", async (probs) => {
    device.chunkSize = 10;

    const file =
      "# Hello World" +
      "\r\nLorem Ipsum\r\nLorem Ipsum\r\nLorem Ipsum\r\nLorem Ipsum\r\nLorem Ipsum" +
      "\r\nLorem Ipsum\r\nLorem Ipsum\r\nLorem Ipsum\r\nLorem Ipsum\r\nLorem Ipsum" +
      "\r\nLorem Ipsum\r\nLorem Ipsum\r\nLorem Ipsum\r\nLorem Ipsum\r\nLorem Ipsum";
    await device.actions.putFile("/flash/a_file.md", file);

    const content = await device.actions.getFile("/flash/a_file.md");
  });
});
