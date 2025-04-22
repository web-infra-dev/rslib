import type { Component } from 'solid-js';
import { CounterButton } from './components/CounterButton';
import { useCounter } from './useCounter';
import './index.scss';

export const Counter: Component = () => {
  const { count, increment, decrement } = useCounter();

  return (
    <div>
      <h1 class="counter-title">Solid</h1>
      <h2 class="counter-text">Counter: {count()}</h2>
      <CounterButton onClick={decrement} label="-" />
      <CounterButton onClick={increment} label="+" />
    </div>
  );
};
