import preprocess from "svelte-preprocess";

const config = {
  preprocess: [
    preprocess({
      scss: {
        prependData: '@import "src/variables.scss";',
      },
    }),
  ],
};

export default config;
