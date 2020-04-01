import winston from 'winston';

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
    ),
});

export default logger;
