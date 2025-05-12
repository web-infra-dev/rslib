export const ImageAlt = (props: { children?: React.ReactNode }) => {
  return (
    <p
      style={{
        textAlign: 'center',
        fontSize: '0.8rem',
        color: '#999',
      }}
    >
      {props.children}
    </p>
  );
};
