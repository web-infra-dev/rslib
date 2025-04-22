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
    classList={{ 'counter-button': true, [styles.button]: true }}
  >
    {props.label}
  </button>
);
