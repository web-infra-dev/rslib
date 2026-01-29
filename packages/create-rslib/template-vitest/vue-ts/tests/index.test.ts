import { render, screen } from '@testing-library/vue';
import { expect, test } from 'vitest';
import Button from '../src/Button.vue';

test('The button should have correct background color', async () => {
  render(Button, {
    props: {
      backgroundColor: '#ccc',
      label: 'Demo Button',
    },
  });
  const button = screen.getByText('Demo Button');
  expect(button).toHaveStyle({
    backgroundColor: '#ccc',
  });
});
