import winston from 'winston';
import env from './env.js';

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(logColors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...rest } = info;
    const restString = Object.keys(rest).length ? `\n${JSON.stringify(rest, null, 2)}` : '';
    return `[${timestamp}] ${level}: ${message}${restString}`;
  })
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    format,
  }),
];

// Add file transport in production
if (env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.uncolorize(),
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.uncolorize(),
    })
  );
}

export const logger = winston.createLogger({
  levels: logLevels,
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports,
});

export default logger;