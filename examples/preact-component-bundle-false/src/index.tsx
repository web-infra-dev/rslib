import type { FunctionComponent } from 'preact';
import { CounterButton } from './components/CounterButton/index';
import { useCounter } from './useCounter';
import './index.scss';

export const Counter: FunctionComponent = () => {
  const { count, increment, decrement } = useCounter();

  return (
    <div>
      <h2 className="counter-text">Counter: {count}</h2>
      <CounterButton onClick={decrement} label="-" />
      <CounterButton onClick={increment} label="+" />
    </div>
  );
};
