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

export const Button = ({
  primary = false,
  size = 'medium',
  backgroundColor,
  label,
  ...props
}: ButtonProps) => {
  const mode = primary ? 'demo-button--primary' : 'demo-button--secondary';
  return (
    <button
      type="button"
      className={['demo-button', `demo-button--${size}`, mode].join(' ')}
      style={{ backgroundColor }}
      {...props}
    >
      {label}
    </button>
  );
};
