import './button.css';

export interface ButtonProps {
  /**
   * Whether the button is primary
   * @default false
   */
  primary?: boolean;
  /**
   * Background color of the button
   */
  backgroundColor?: string;
  /**
   * Size of Button
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Label of the button
   */
  label: string;
  /**
   * Optional click handler
   */
  onClick?: () => void;
}

export function Button(props: ButtonProps) {
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
