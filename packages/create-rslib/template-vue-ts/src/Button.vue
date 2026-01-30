<script setup lang="ts">
import { computed } from 'vue';
import './style.css';

interface Props {
  primary?: boolean;
  backgroundColor?: string;
  size?: 'small' | 'medium' | 'large';
  label: string;
  onClick?: () => void;
}

const {
  primary = false,
  backgroundColor = undefined,
  size = 'medium',
  label,
  onClick = undefined,
} = defineProps<Props>();

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
