import type { RequestHandler } from 'express';
import { logRequest } from './logger';
import { defaultOptions, type LoggerOptions } from './types';

export function expressLogger(
  options: Partial<LoggerOptions> = {},
): RequestHandler {
  const mergedOptions = { ...defaultOptions, ...options };
  return (req, _res, next) => {
    logRequest(req, mergedOptions);
    next();
  };
}

export * from './types';
