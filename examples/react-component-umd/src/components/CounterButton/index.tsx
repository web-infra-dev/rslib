import type React from 'react';
import logo from '../../assets/logo.svg';
import styles from './index.module.scss';

interface CounterButtonProps {
  onClick: () => void;
  label: string;
}

export const CounterButton: React.FC<CounterButtonProps> = ({
  onClick,
  label,
}) => (
  <button
    type="button"
    className={`${styles.button} counter-button`}
    onClick={onClick}
  >
    <img src={logo} alt="react" />
    {label}
  </button>
);
