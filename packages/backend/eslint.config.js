const node = require('eslint-plugin-n');
const unicorn = require('eslint-plugin-unicorn');
const perfectionist = require('eslint-plugin-perfectionist');
const prettier = require('eslint-config-prettier');
const globals = require('globals');
const tseslint = require('typescript-eslint');

module.exports = [
  {
    ignores: ['node_modules/**', 'dist/**']
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node
    },
    plugins: {
      n: node,
      unicorn,
      perfectionist
    },
    rules: {
      ...prettier.rules,
      'n/no-callback-literal': 'error',
      'unicorn/filename-case': 'off',
      'perfectionist/sort-imports': 'error'
    }
  }
];
