import winston from 'winston';

export function createLogger(level: string) {
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
            level: 'error',
        }),
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
    ),
});

export default logger;
