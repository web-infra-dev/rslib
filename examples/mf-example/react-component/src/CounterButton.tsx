interface CounterButtonProps {
  onClick: () => void;
  label: string;
}

export const CounterButton: React.FC<CounterButtonProps> = ({
  onClick,
  label,
}) => (
  <button type="button" onClick={onClick}>
    {label}
  </button>
);
