import { render, screen } from '@testing-library/react';
import React from 'react';
import { expect, test } from 'vitest';
import { Button } from '../src/Button';

test('Link changes the state when hovered', async () => {
  render(<Button backgroundColor="#ccc">Rslib Button</Button>);
  const button = screen.getByText('Rslib Button');
  expect(button).toHaveStyle({
    backgroundColor: '#ccc',
  });
});
