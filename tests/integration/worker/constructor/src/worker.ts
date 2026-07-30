import { add } from './helper';

self.onmessage = ({ data }: MessageEvent<[number, number]>) => {
  self.postMessage(add(data[0], data[1]));
};
