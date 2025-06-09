module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended',
  ],
  overrides: [],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'server.js', 'vite.config.ts'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: ['import', 'react', '@typescript-eslint', 'prettier', 'react-refresh', 'simple-import-sort'],
  rules: {
    "no-unused-vars": "off",
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
  },
}