// /** @param {string} protocolAndPath */
// export const parseProtocolAndPath = (protocolAndPath) => {
//   const matches = protocolAndPath.match(/^(.+):\/(.+)$/);
//   if (!matches) throw new Error(`Path "${protocolAndPath}" did not match <protocol>://</path>`);
//   return matches.slice(1);
// };

/**
 * parses the path <scheme>://[user][:pass][@host][:port]/<path>
 * @param {string} fullPath
 * @returns
 */
export const parsePath = (fullPath) => {
  const matches = fullPath.match(/^(.+)?:\/\/((.+):(.+)?@)?([^/:]+)?(:([^/]+))?(\/.+)?/);
  const [, protocol, , user, pass, host, , port, path] = matches;
  return { protocol, user, pass, path, host, port };
};

const protocol = "serial://";
const user = "user:pass@";
const host = "hostname";
const port = ":8000";
const path = "/path/to/place";

// console.log(parsePath(protocol+path))
console.log(parsePath(protocol + port));
console.log(parsePath(protocol + path));
console.log(parsePath(protocol + port + path));
console.log(parsePath(protocol + host + path));
console.log(parsePath(protocol + host + port + path));
console.log(parsePath(protocol + user + path));
console.log(parsePath(protocol + user + port + path));
console.log(parsePath(protocol + user + host + path));
console.log(parsePath(protocol + user + host + port + path));
// console.log(parsePath(protocol+host+port+path))

// console.log(parsePath("serial:///path/to/place"));
// console.log(parsePath("serial://hostname:port/path/to/place"));
// console.log(parsePath("serial://user:pass@hostname:port/path/to/place"));
