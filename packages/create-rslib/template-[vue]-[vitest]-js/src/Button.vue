<template>
  <button
    type="button"
    :class="['demo-button', `demo-button--${size}`, mode]"
    :style="{ backgroundColor }"
    @click="onClick"
  >
    {{ label }}
  </button>
</template>

<script>
import './button.css';

export default {
  name: 'Button',
  props: {
    primary: {
      type: Boolean,
      default: false,
    },
    backgroundColor: {
      type: String,
      default: undefined,
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value),
    },
    label: {
      type: String,
      required: true,
    },
    onClick: {
      type: Function,
      default: undefined,
    },
  },
  computed: {
    mode() {
      return this.primary ? 'demo-button--primary' : 'demo-button--secondary';
    },
  },
};
</script>
