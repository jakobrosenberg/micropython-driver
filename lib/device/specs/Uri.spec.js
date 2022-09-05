import { DeviceUrl } from "../DeviceUri.js";
import { getException } from "../../../tests/utils.js";

test("can parse path", () => {
  const protocol = "serial://";
  const user = "user:pass@";
  const host = "hostname:";
  const port = ":8000";
  const hostport = "hostname:8000";
  const path = "/path/to/place";

  const serialize = (c) => [c.protocol, c.user, c.pass, c.host, c.port, c.path].map((c) => c || "").join(",");

  assert.equal(serialize(new DeviceUrl(protocol + "com6")), "serial,,,,,com6");
  assert.equal(serialize(new DeviceUrl(protocol + path)), "serial,,,,,/path/to/place");
  assert.equal(serialize(new DeviceUrl(protocol + port + "/" + path)), "serial,,,,8000,/path/to/place");
  assert.equal(serialize(new DeviceUrl(protocol + host + "/" + path)), "serial,,,hostname,,/path/to/place");
  assert.equal(serialize(new DeviceUrl(protocol + hostport + "/" + path)), "serial,,,hostname,8000,/path/to/place");
  assert.equal(serialize(new DeviceUrl(protocol + user + path)), "serial,user,pass,,,/path/to/place");
  assert.equal(serialize(new DeviceUrl(protocol + user + port + "/" + path)), "serial,user,pass,,8000,/path/to/place");
  assert.equal(
    serialize(new DeviceUrl(protocol + user + host + "/" + path)),
    "serial,user,pass,hostname,,/path/to/place"
  );
  assert.equal(
    serialize(new DeviceUrl(protocol + user + hostport + "/" + path)),
    "serial,user,pass,hostname,8000,/path/to/place"
  );
});

test("missing url throws error", () => {
  /** @ts-ignore empty url is not allowed */
  const error = getException(() => new DeviceUrl());
  assert.equal(error.message, "Url should be either a string or an object");
});

test("bad url string throws error", () => {
  const error = getException(() => new DeviceUrl("/abc"));
  assert.equal(error.message, "Protocol should be 'telnet' or 'serial'. Received 'undefined'");
});

test("objects are accepted input", () => {
  const error = getException(() => new DeviceUrl({ protocol: "serial" }));
  assert.equal(error.message, 'Path is missing from URL. Received {"protocol":"serial"}');
});

// 'serial,,,:8000/,8000,path/to/place'
// 'serial,,,,8000,/path/to/place'
