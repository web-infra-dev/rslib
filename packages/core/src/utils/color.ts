import { styleText } from 'node:util';

type ColorFn = (text: string | number) => string;
type ColorMap = Record<
  'blue' | 'bold' | 'cyan' | 'dim' | 'gray' | 'green' | 'magenta' | 'yellow',
  ColorFn
>;

const createStyler =
  (style: Parameters<typeof styleText>[0]): ColorFn =>
  (text) =>
    styleText(style, String(text));

export const color: ColorMap = {
  blue: createStyler('blue'),
  bold: createStyler('bold'),
  cyan: createStyler('cyan'),
  dim: createStyler('dim'),
  gray: createStyler('gray'),
  green: createStyler('green'),
  magenta: createStyler('magenta'),
  yellow: createStyler('yellow'),
};
