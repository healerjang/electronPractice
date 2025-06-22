import 'dotenv/config'
import {createLogger, format, transports} from 'winston'

const env = process.env.NODE_ENV || 'development';
const logLevel = process.env.LOG_LEVEL || (env === 'development' ? 'debug' : 'info');
const logFilePath = process.env.LOG_FILE_PATH || 'app.log';

const loggerTransports = [];

if (env === 'development') {
    loggerTransports.push(
        new transports.Console({
            level: logLevel,
            format: format.combine(
                format.colorize(),
                format.timestamp(),
                format.printf(({ timestamp, level, message, ...meta }) => {
                    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
                    return `[${timestamp}] ${level}: ${message} ${metaStr}`;
                })
            )
        })
    );
} else {
    loggerTransports.push(
        new transports.File({
            filename: logFilePath,
            level: 'error',
            format: format.combine(
                format.timestamp(),
                format.json()
            ),
            handleExceptions: true,
        })
    );
}

const logger = createLogger({
    level: env === 'development' ? logLevel : 'error',
    transports: loggerTransports,
    exitOnError: false,
});

export default logger