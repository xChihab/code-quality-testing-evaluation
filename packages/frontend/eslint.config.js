const react = require('eslint-plugin-react')
const reactHooks = require('eslint-plugin-react-hooks')
const jsxA11y = require('eslint-plugin-jsx-a11y')
const perfectionist = require('eslint-plugin-perfectionist')
const prettier = require('eslint-config-prettier')
const globals = require('globals')

module.exports = [
  {
    ignores: ['build/**']
  },
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
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
      perfectionist
    },
    //pour adapter les regles esLint a la version de react
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      ...prettier.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'perfectionist/sort-imports': 'error'
    }
  }
]
