import { render, screen } from '@lynx-js/react/testing-library';
import { expect, test } from '@rstest/core';
import { ScrollList } from '../src/ScrollList';

test('renders the color items', () => {
  render(<ScrollList />);

  for (const color of ['red', 'green', 'blue']) {
    const item = screen.getByText(color).parentElement;
    expect(item?.style.backgroundColor).toBe(color);
  }
});
