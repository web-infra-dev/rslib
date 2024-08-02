export interface LoggerOptions {
  logLevel: 'info' | 'debug' | 'warn' | 'error';
  logBody: boolean;
}

export const defaultOptions: LoggerOptions = {
  logLevel: 'info',
  logBody: false,
};
