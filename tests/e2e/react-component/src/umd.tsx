const React = window.React;
const ReactDOM = window.ReactDOM;

// @ts-expect-error not types for UMD
const RslibUmdExample = window.RslibUmdExample;
const Counter = RslibUmdExample.Counter;

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
