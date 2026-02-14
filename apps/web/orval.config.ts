import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: {
      target: 'http://localhost:3000/docs/json',
    },
    output: {
      mode: 'tags-split',
      target: './lib/api',
      schemas: './lib/api/models',
      client: 'fetch',
      httpClient: 'fetch',
      override: {
        mutator: {
          path: './lib/custom-client.ts',
          name: 'customInstance',
        },
      },
    },
  },
  apiClient: {
    input: {
      target: 'http://localhost:3000/docs/json',
    },
    output: {
      mode: 'tags-split',
      target: './lib/client',
      schemas: './lib/api/models',
      client: 'swr',
      httpClient: 'fetch',
      override: {
        mutator: {
          path: './lib/custom-client.ts',
          name: 'customInstance',
        },
      },
    },
  },
});
