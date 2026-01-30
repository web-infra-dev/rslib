<script setup>
import { computed } from 'vue';
import './style.css';

const {
  primary = false,
  backgroundColor,
  size = 'medium',
  label,
  onClick,
} = defineProps({
  primary: {
    type: Boolean,
  },
  backgroundColor: {
    type: String,
  },
  size: {
    type: String,
  },
  label: {
    type: String,
  },
  onClick: {
    type: Function,
  },
});

const mode = computed(() =>
  primary ? 'demo-button--primary' : 'demo-button--secondary',
);
</script>

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
