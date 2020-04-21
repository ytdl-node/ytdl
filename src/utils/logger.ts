import winston from 'winston';

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

    if (!levels[level]) {
        throw new Error('Invalid logging level.');
    }

    const logger = winston.createLogger({
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
