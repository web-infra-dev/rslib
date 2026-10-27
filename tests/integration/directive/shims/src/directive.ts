'use server';

export const paths = [__dirname, __filename, import.meta.url];
export const resolvePath = () => require.resolve('node:path');
