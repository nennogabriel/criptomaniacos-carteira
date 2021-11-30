export const Button = {
  baseStyle: {
    fontWeight: 'semibold', // Normally, it is "semibold"
  },
  sizes: {
    xl: {
      h: '56px',
      fontSize: 'lg',
      px: '32px',
    },
  },
  variants: {
    solid: () => ({
      textTransform: 'uppercase',
      fontWeight: 'bold',
      borderRadius: 24,
      cursor: 'pointer',
    }),
    outline: () => ({
      textTransform: 'uppercase',
      fontWeight: 'bold',
      borderRadius: 24,
      cursor: 'pointer',
      border: '2px solid',
    }),
    link: () => ({
      cursor: 'pointer',
    }),
  },
};
