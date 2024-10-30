import React from 'react';
import './button.css';

export const Button = ({
  primary = false,
  size = 'medium',
  backgroundColor,
  label,
  ...props
}) => {
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
