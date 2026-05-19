import { describe, expect, it, rs } from '@rstest/core';
import { mount, tick, unmount } from 'svelte';
import Button from '../src/Button.svelte';

function mountButton(props) {
  const target = document.createElement('div');
  document.body.append(target);
  const component = mount(Button, { target, props });
  const button = target.querySelector('button');

  if (!button) {
    throw new Error('Expected button to be rendered');
  }

  return { button, component, target };
}

describe('Button', () => {
  it('renders with default label', () => {
    const { button, component, target } = mountButton();

    expect(button.textContent).toBe('Demo Button: 0');

    unmount(component);
    target.remove();
  });

  it('renders with custom label', () => {
    const { button, component, target } = mountButton({ label: 'Count' });

    expect(button.textContent).toBe('Count: 0');

    unmount(component);
    target.remove();
  });

  it('increments count on click', async () => {
    const { button, component, target } = mountButton({ label: 'Test' });

    expect(button.textContent).toBe('Test: 0');
    button.click();
    await tick();
    expect(button.textContent).toBe('Test: 1');

    unmount(component);
    target.remove();
  });

  it('calls onclick callback with count', () => {
    const handleClick = rs.fn();
    const { button, component, target } = mountButton({ onclick: handleClick });

    button.click();
    expect(handleClick).toHaveBeenLastCalledWith(1);

    unmount(component);
    target.remove();
  });
});
