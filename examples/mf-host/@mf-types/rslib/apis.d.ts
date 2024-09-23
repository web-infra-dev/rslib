export type RemoteKeys = 'rslib';
type PackageType<T> = T extends 'rslib' ? typeof import('rslib') : any;
