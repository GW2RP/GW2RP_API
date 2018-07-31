const util = require('util');

class Logger {
    constructor(context) {
        this.context = context;
    }

    log(message) {
        const date = new Date();
        if (typeof message !== "string") {
            message = util.inspect(message);
        }
        if (typeof message !== "string") {
            message = util.inspect(message);
        }
        console.log(`${date.toISOString()} - [\x1b[37mVERBOSE\x1b[0m] < ${this.context || "System" } > : ${message.trim()}`);
    }

    debug(message) {
        const date = new Date();
        if (typeof message !== "string") {
            message = util.inspect(message);
        }
        console.log(`${date.toISOString()} - [\x1b[37mDEBUG\x1b[0m] < ${this.context || "System" } > : ${message.trim()}`);
    }

    info(message) {
        const date = new Date();
        if (typeof message !== "string") {
            message = util.inspect(message);
        }
        console.info(`${date.toISOString()} - [\x1b[36mINFO\x1b[0m] < ${this.context || "System" } > : ${message.trim()}`);
    }

    warn(message) {
        const date = new Date();
        if (typeof message !== "string") {
            message = util.inspect(message);
        }
        console.warn(`${date.toISOString()} - [\x1b[33WARN\x1b[0m] < ${this.context || "System" } > : ${message.trim()}`);
    }

    error(message) {
        const date = new Date();
        if (typeof message !== "string") {
            message = util.inspect(message);
        }
        console.error(`${date.toISOString()} - [\x1b[31mERROR\x1b[0m] < ${this.context || "System" } > : ${message.trim()}`);
    }
}

module.exports = (context) => new Logger(context);