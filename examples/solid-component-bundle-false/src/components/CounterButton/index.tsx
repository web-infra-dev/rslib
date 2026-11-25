import type { Component } from 'solid-js';
import styles from './index.module.scss';

interface CounterButtonProps {
  onClick: () => void;
  label: string;
}

export const CounterButton: Component<CounterButtonProps> = (props) => (
  <button
    type="button"
    onClick={props.onClick}
    class={`counter-button ${styles.button}`}
  >
    {props.label}
  </button>
);
