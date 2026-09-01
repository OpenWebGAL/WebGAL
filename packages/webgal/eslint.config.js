const js = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const prettierConfig = require('eslint-config-prettier');
const prettier = require('eslint-plugin-prettier');
const react = require('eslint-plugin-react');
const globals = require('globals');
const tseslint = require('typescript-eslint');

module.exports = defineConfig([
  {
    ignores: ['**/*.{css,ico,md,mp3,otf,scss,svg,ttf,txt,wav}'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  {
    files: ['src/**/*.{ts,tsx}'],
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
    languageOptions: {
      globals: globals.browser,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      complexity: ['error', 30],
      'linebreak-style': ['error', 'unix'],
      'no-prototype-builtins': 'off',
      'no-useless-escape': 'off',
      'prefer-const': 'off',
      semi: 'error',
      'semi-style': ['error', 'last'],
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-unused-expressions': [
        'error',
        { allowShortCircuit: true, allowTaggedTemplates: true, allowTernary: true },
      ],
      '@typescript-eslint/no-unused-vars': 'off',
      'react/jsx-no-useless-fragment': ['error', { allowExpressions: true }],
    },
  },
  prettierConfig,
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      prettier,
    },
    rules: {
      'arrow-body-style': 'off',
      'prefer-arrow-callback': 'off',
      'prettier/prettier': 'error',
    },
  },
]);
