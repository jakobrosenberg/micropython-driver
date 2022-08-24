/**
 * @typedef {Object} InputOptions
 * @prop {'serial'|'telnet'} protocol
 * @prop {string} user
 * @prop {string} pass
 * @prop {string} path
 * @prop {string} host
 * @prop {string|number} port
 */

export class DeviceUrl {
  /** @type InputOptions */
  static InputOptions;

  /**
   * @param {Partial<InputOptions> | string | DeviceUrl} url
   */
  constructor(url) {
    if (!url) throw new Error("Url should be either a string or an object");

    const _options = typeof url === "string" ? DeviceUrl.parsePath(url) : url;
    this.protocol = _options.protocol;
    this.user = _options.user;
    this.pass = _options.pass;
    this.host = _options.host;
    this.port = _options.port;
    this.path = _options.path;

    if (!["serial", "telnet"].includes(this.protocol))
      throw new Error(`Protocol should be 'telnet' or 'serial'. Received '${this.protocol}'`);
    if (!this.path) throw new Error(`Path is missing from URL. Received ${JSON.stringify(url)}`);
  }

  /**
   * parses the path <scheme>://[user][:pass][@host][:port]/<path>
   * @param {string} fullPath
   */
  static parsePath = (fullPath) => {
    const matches = fullPath.match(/^((.+?):\/\/)?((.+):(.+)?@)?((.*?):(.*?)\/)?(.+)/);
    if (!matches) throw new Error(`Path "${fullPath}" is not a valid URI`);
    const [, , protocol, , user, pass, , host, port, path] = matches;
    return { protocol, user, pass, path, host, port };
  };
}
