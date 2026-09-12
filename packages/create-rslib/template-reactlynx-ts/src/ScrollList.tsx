import type { JSX } from '@lynx-js/react';

export function ScrollList(): JSX.Element {
  return (
    <scroll-view
      scroll-orientation="horizontal"
      style={{ width: '240px', height: '80px' }}
    >
      {['red', 'green', 'blue'].map((color) => (
        <view
          key={color}
          style={{ width: '120px', height: '80px', backgroundColor: color }}
        >
          <text style={{ color: 'white' }}>{color}</text>
        </view>
      ))}
    </scroll-view>
  );
}
