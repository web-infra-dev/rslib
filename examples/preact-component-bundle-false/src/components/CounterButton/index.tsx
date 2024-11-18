import type { FunctionComponent } from 'preact';
import styles from './index.module.scss';

interface CounterButtonProps {
  onClick: () => void;
  label: string;
}

export const CounterButton: FunctionComponent<CounterButtonProps> = ({
  onClick,
  label,
}) => (
  <button type="button" className={styles.button} onClick={onClick}>
    {label}
  </button>
);
