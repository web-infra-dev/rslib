<script setup>
import { ref } from 'vue';
const card = ref('Card!');
</script>

<template>
  <p class="component card">{{ card }}</p>
</template>

<style>
.card {
  color: red;
  font-weight: bold;
}
</style>
