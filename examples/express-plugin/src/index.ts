import type { RequestHandler } from 'express';
import { logRequest } from './logger';
import { type LoggerOptions, defaultOptions } from './types';

export function expressLogger(
  options: Partial<LoggerOptions> = {},
): RequestHandler {
  const mergedOptions = { ...defaultOptions, ...options };
  return (req, res, next) => {
    logRequest(req, mergedOptions);
    next();
  };
}

export * from './types';
