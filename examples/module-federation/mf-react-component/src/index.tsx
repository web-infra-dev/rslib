import { init, loadRemote } from '@module-federation/enhanced/runtime';
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
      <h2>
        <span id="mf-e2e-lib-title">Counter From Rslib MF Format: </span>
        <span id="mf-e2e-lib-content">{count}</span>
      </h2>
      <CounterButton id="mf-e2e-lib-decrease" onClick={decrement} label="-" />
      <CounterButton id="mf-e2e-lib-increase" onClick={increment} label="+" />
    </div>
  );
};
