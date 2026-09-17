import { expect, test } from '@rstest/core';
import { render, screen } from '@solidjs/testing-library';
import { Button } from '../src/Button';

test('The button should have correct background color', async () => {
  render(() => <Button backgroundColor="#ccc" label="Demo Button" />);
  const button = screen.getByText('Demo Button');
  expect(button).toHaveStyle({
    'background-color': '#ccc',
  });
});
