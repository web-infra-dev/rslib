import type { Request } from 'express';
import type { LoggerOptions } from './types';

export function logRequest(req: Request, options: LoggerOptions): void {
  const { method, url } = req;
  const logMessage = `${method} ${url}`;

  switch (options.logLevel) {
    case 'debug':
      console.debug(logMessage);
      break;
    case 'warn':
      console.warn(logMessage);
      break;
    case 'error':
      console.error(logMessage);
      break;
    default:
      console.log(logMessage);
  }

  if (options.logBody && req.body) {
    console.log('Request body:', req.body);
  }
}
