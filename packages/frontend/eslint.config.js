const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const jsxA11y = require('eslint-plugin-jsx-a11y');
const perfectionist = require('eslint-plugin-perfectionist');
const prettier = require('eslint-config-prettier');
const globals = require('globals');
const path = require('path');
const tseslint = require('typescript-eslint');
const tailwind = require('eslint-plugin-tailwindcss');

module.exports = [
  {
    ignores: ['build/**']
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        //pour que le jsx soit pris en compte par esLint sinon la syntaxe n'est pas validé
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: globals.browser
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      perfectionist,
      tailwindcss: tailwind
    },
    //pour adapter les regles esLint a la version de react
    settings: {
      react: {
        version: 'detect'
      },
      tailwindcss: {
        config: path.join(__dirname, 'tailwind.config.js')
      }
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      ...prettier.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'perfectionist/sort-imports': 'error',
      // règles Tailwind en erreur (et non en warning) pour bloquer le commit via lint-staged
      ...Object.fromEntries(
        Object.entries(tailwind.configs.recommended.rules).map(([rule, level]) => [
          rule,
          level === 'off' ? 'off' : 'error'
        ])
      )
    }
  }
];
