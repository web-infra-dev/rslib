import { init, loadRemote } from '@rsbuild/plugin-module-federation/runtime';
import { Suspense, createElement, lazy } from 'react';

import { CounterButton } from './CounterButton';
import { useCounter } from './useCounter';

init({
  name: 'rslib_provider',
  remotes: [
    {
      name: 'mf_remote',
      entry: 'http://localhost:3002/mf-manifest.json',
    },
  ],
});

export const Counter: React.FC = () => {
  const { count, increment, decrement } = useCounter();

  return (
    <div>
      <Suspense fallback={<div>loading</div>}>
        {createElement(
          lazy(
            () =>
              loadRemote('mf_remote') as Promise<{
                default: React.FC;
              }>,
          ),
        )}
      </Suspense>
      <h2>Counter From Rslib MF Format: {count}</h2>
      <CounterButton onClick={decrement} label="-" />
      <CounterButton onClick={increment} label="+" />
    </div>
  );
};
