import { Counter } from '@examples/react-component-bundle-false';
import React from 'react';
import ReactDOM from 'react-dom/client';

const App = () => (
  <div>
    <Counter />
  </div>
);

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
