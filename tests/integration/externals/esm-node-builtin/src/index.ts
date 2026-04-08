import send from './send.cjs';

export const SendStream = send.SendStream;
export const sendStreamPrototypeIsInherited = send.isInheritedCorrectly;
export const loadOsPlatform = async () => (await import('node:os')).platform();
export const loadPathSep = async () => (await import('node:path')).sep;
