import { expect, test } from '@rstest/core';
import { mount, unmount } from 'svelte';
import Button from '../src/Button.svelte';

test('The button should render the default label', () => {
  const target = document.createElement('div');
  document.body.append(target);
  const component = mount(Button, { target });
  const button = target.querySelector('button');

  if (!button) {
    throw new Error('Expected button to be rendered');
  }

  expect(button.textContent).toBe('Demo Button');

  unmount(component);
  target.remove();
});
