import { Counter } from '@examples/react-component-bundle';
import React from 'react';
import ReactDOM from 'react-dom/client';
import '@examples/react-component-bundle/dist/esm/index.css';

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
