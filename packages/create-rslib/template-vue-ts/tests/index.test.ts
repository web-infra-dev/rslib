import { expect, test } from '@rstest/core';
import { mount } from '@vue/test-utils';
import Button from '../src/Button.vue';

test('The button should have correct background color', () => {
  const wrapper = mount(Button, {
    attachTo: document.body,
    props: {
      backgroundColor: '#ccc',
      label: 'Demo Button',
    },
  });
  expect(wrapper.get('button').element).toHaveStyle({
    backgroundColor: '#ccc',
  });
  wrapper.unmount();
});
