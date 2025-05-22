<template>
  <div>
    <h2 class="counter-text">Counter: {{ count }}</h2>
    <counter-button @click="decrement" label="-" />
    <counter-button @click="increment" label="+" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CounterButton from './CounterButton.vue';

const count = ref(0);

const increment = () => count.value++;
const decrement = () => count.value--;
</script>

<style scoped>
.counter-text {
  font-size: 50px;
}
</style>
