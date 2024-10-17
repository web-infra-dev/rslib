import React from 'react';
import styles from './index.module.scss';

interface CounterButtonProps {
  onClick: () => void;
  label: string;
}

export const CounterButton: React.FC<CounterButtonProps> = ({
  onClick,
  label,
}) => (
  <button type="button" className={styles.button} onClick={onClick}>
    {label}
  </button>
);
