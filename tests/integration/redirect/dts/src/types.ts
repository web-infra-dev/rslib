export interface LoggerOptions {
  logLevel: 'info' | 'debug' | 'warn' | 'error';
  logBody: boolean;
}

export const defaultOptions: LoggerOptions = {
  logLevel: 'info',
  logBody: false,
};

export interface Foo {
  foo: string;
}

export interface Bar {
  bar: string;
}

export interface Baz {
  baz: string;
}
