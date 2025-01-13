import type { FunctionComponent } from 'preact';
import logo from '../../assets/logo.svg';
import styles from './index.module.scss';

interface CounterButtonProps {
  onClick: () => void;
  label: string;
}

export const CounterButton: FunctionComponent<CounterButtonProps> = ({
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
