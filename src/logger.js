// Logger utility with chalk for colorful console output
const chalk = require('chalk');
const path = require('path');

// Get current timestamp in a readable format
const getTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

// Get the caller file name for better context in logs
const getCallerFile = () => {
    const err = new Error();
    const stack = err.stack.split('\n');
    // Get the file that called the logger function (index 3 in the stack)
    if (stack.length >= 4) {
        const callerLine = stack[3].trim();
        const match = callerLine.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/i);
        if (match) {
            return path.basename(match[2]);
        }
    }
    return 'unknown';
};

const logger = {
    // Regular info logs
    info: (message) => {
        const timestamp = chalk.gray(`[${getTimestamp()}]`);
        const type = chalk.blue.bold('[INFO]');
        const source = chalk.cyan(`[${getCallerFile()}]`);
        console.log(`${timestamp} ${type} ${source} ${message}`);
    },

    // Success logs (green)
    success: (message) => {
        const timestamp = chalk.gray(`[${getTimestamp()}]`);
        const type = chalk.green.bold('[SUCCESS]');
        const source = chalk.cyan(`[${getCallerFile()}]`);
        console.log(`${timestamp} ${type} ${source} ${message}`);
    },

    // Warning logs (yellow)
    warn: (message) => {
        const timestamp = chalk.gray(`[${getTimestamp()}]`);
        const type = chalk.yellow.bold('[WARNING]');
        const source = chalk.cyan(`[${getCallerFile()}]`);
        console.log(`${timestamp} ${type} ${source} ${message}`);
    },

    // Error logs (red)
    error: (message, error) => {
        const timestamp = chalk.gray(`[${getTimestamp()}]`);
        const type = chalk.red.bold('[ERROR]');
        const source = chalk.cyan(`[${getCallerFile()}]`);
        console.log(`${timestamp} ${type} ${source} ${message}`);
        if (error && error.stack) {
            console.log(chalk.red(error.stack));
        }
    },

    // Rate limit logs (magenta)
    rateLimit: (message, ip) => {
        const timestamp = chalk.gray(`[${getTimestamp()}]`);
        const type = chalk.magenta.bold('[RATE LIMIT]');
        const source = chalk.cyan(`[${getCallerFile()}]`);
        const ipInfo = ip ? chalk.yellow(`[IP: ${ip}]`) : '';
        console.log(`${timestamp} ${type} ${source} ${ipInfo} ${message}`);
    },

    // Ban logs (red background)
    ban: (message, ip, duration) => {
        const timestamp = chalk.gray(`[${getTimestamp()}]`);
        const type = chalk.bgRed.white.bold('[BAN]');
        const source = chalk.cyan(`[${getCallerFile()}]`);
        const ipInfo = ip ? chalk.yellow(`[IP: ${ip}]`) : '';
        const durationInfo = duration ? chalk.yellow(`[Duration: ${duration}]`) : '';
        console.log(`${timestamp} ${type} ${source} ${ipInfo} ${durationInfo} ${message}`);
    },

    // Request logs (cyan)
    request: (method, path, ip, statusCode) => {
        const timestamp = chalk.gray(`[${getTimestamp()}]`);
        const type = chalk.cyan.bold('[REQUEST]');
        const methodColor = method === 'GET' ? chalk.green(method) : 
                           method === 'POST' ? chalk.yellow(method) : 
                           method === 'PUT' ? chalk.blue(method) : 
                           method === 'DELETE' ? chalk.red(method) : chalk.white(method);
        const pathInfo = chalk.white(path);
        const ipInfo = ip ? chalk.yellow(`[IP: ${ip}]`) : '';
        const statusInfo = statusCode ? 
            (statusCode >= 200 && statusCode < 300 ? chalk.green(`[${statusCode}]`) : 
             statusCode >= 400 && statusCode < 500 ? chalk.yellow(`[${statusCode}]`) : 
             statusCode >= 500 ? chalk.red(`[${statusCode}]`) : 
             chalk.white(`[${statusCode}]`)) : '';
        console.log(`${timestamp} ${type} ${methodColor} ${pathInfo} ${ipInfo} ${statusInfo}`);
    },

    // API token check logs
    tokenCheck: (valid, username) => {
        const timestamp = chalk.gray(`[${getTimestamp()}]`);
        const type = chalk.blue.bold('[TOKEN CHECK]');
        const source = chalk.cyan(`[${getCallerFile()}]`);
        const status = valid ? 
            chalk.green.bold('[VALID]') : 
            chalk.red.bold('[INVALID]');
        const userInfo = username ? chalk.yellow(`[User: ${username}]`) : '';
        console.log(`${timestamp} ${type} ${source} ${status} ${userInfo}`);
    }
};

module.exports = logger;
