import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: {
      target: 'http://localhost:3000/docs/json',
    },
    output: {
      mode: 'tags-split',
      target: './lib/client/index.ts',
      schemas: './lib/client/model',
      client: 'fetch',
      override: {
          mutator: {
            path: './lib/custom-client.ts',
            name: 'customInstance',
          },
      },
    }
  },
});
