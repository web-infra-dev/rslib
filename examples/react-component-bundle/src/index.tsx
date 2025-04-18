import type React from 'react';
import { CounterButton } from './components/CounterButton';
import { useCounter } from './useCounter';
import './index.scss';

export const Counter: React.FC = () => {
  const { count, increment, decrement } = useCounter();

  return (
    <div>
      <h1 className="counter-title">React</h1>
      <h2 className="counter-text">Counter: {count}</h2>
      <CounterButton onClick={decrement} label="-" />
      <CounterButton onClick={increment} label="+" />
    </div>
  );
};
