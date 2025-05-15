<template>
  <button type="button" @click="onClick">{{ label }}</button>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  onClick: () => void;
}>();
</script>

<style scoped>
.button {
  background: yellow;
}
</style>
