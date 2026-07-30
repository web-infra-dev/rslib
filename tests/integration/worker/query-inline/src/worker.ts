self.onmessage = ({ data }: MessageEvent<number>) => {
  self.postMessage(data * 2);
};
