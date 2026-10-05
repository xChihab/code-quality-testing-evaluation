const node = require('eslint-plugin-n');
const unicorn = require('eslint-plugin-unicorn');
const perfectionist = require('eslint-plugin-perfectionist');
const prettier = require('eslint-config-prettier');
const globals = require('globals');

module.exports = [
  {
    ignores: ['node_modules/**']
  },
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
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
