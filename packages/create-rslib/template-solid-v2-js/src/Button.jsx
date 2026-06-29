import './button.css';

export function Button(props) {
  const mode = () =>
    props.primary ? 'demo-button--primary' : 'demo-button--secondary';
  const size = () => props.size ?? 'medium';

  return (
    <button
      type="button"
      class={`demo-button demo-button--${size()} ${mode()}`}
      style={{ 'background-color': props.backgroundColor }}
      onClick={props.onClick}
    >
      {props.label}
    </button>
  );
}
