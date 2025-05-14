export const ImageAlt = (props: { children?: React.ReactNode }) => {
  return (
    <p
      style={{
        textAlign: 'center',
        fontSize: '0.8rem',
        margin: '0.5rem 0',
        color: '#999',
      }}
    >
      {props.children}
    </p>
  );
};
