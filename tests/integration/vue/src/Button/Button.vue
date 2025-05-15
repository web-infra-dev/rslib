<script setup>
import './style.less';
import { ref } from 'vue';
const button = ref('Button!');
</script>

<template>
  <p class="component button">{{ button }}</p>
</template>

<style>
.button {
  font-weight: bold;
}
</style>
