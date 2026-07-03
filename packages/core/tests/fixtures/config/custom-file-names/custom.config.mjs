export default {
  source: {
    define: {
      CONFIG_FILE_NAME: JSON.stringify('custom'),
    },
  },
};

export const namedConfig = {
  source: {
    define: {
      CONFIG_FILE_NAME: JSON.stringify('named'),
    },
  },
};
