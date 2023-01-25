import nodeAdapter from '@sveltejs/adapter-node';
import preprocess from 'svelte-preprocess';
import importAssets from 'svelte-preprocess-import-assets';
import seqPreprocessor from 'svelte-sequential-preprocessor';

import path from 'path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  compilerOptions: {
    enableSourcemap: true,
  },

  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [
    seqPreprocessor([
      preprocess({
        sourceMap: true,
        typescript: { soruceMap: true },
      }),
      importAssets(),
    ]),
  ],

  kit: {
    inlineStyleThreshold: 2048,
    adapter: nodeAdapter({ out: 'build', precompress: true }),
  },
};

export default config;
