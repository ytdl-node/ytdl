import winston from 'winston';

/**
 * Returns a new logger with transports to console.
 * @param level Stores the logger level
 */
export function createLogger(level: string) {
    type level = {
        [key: string]: number
    };
    const levels: level = {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        verbose: 4,
        debug: 5,
        silly: 6,
    };

    if (levels[level] === undefined) {
        throw new Error('Invalid logging level.');
    }

    const logger = winston.createLogger({
        level,
        transports: [
            new winston.transports.Console({
                level,
            }),
        ],
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
        ),
    });
    return logger;
}

/**
 * Stores the default logger.
 */
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            level: 'info',
        }),
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
    ),
});

export default logger;
