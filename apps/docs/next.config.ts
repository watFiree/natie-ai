import nextra from 'nextra';

const withNextra = nextra({
  codeHighlight: true,
  readingTime: true,
  search: true,
});

export default withNextra({
  reactCompiler: true,
  output: 'standalone',
});
