import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist/**', 'src/generated/**', 'node_modules/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': ['warn', { allow: ['log', 'warn', 'error'] }],
      eqeqeq: ['error', 'smart'],
      'max-lines': ['warn', { max: 200, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 15, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    files: ['__tests__/**'],
    rules: {
      'max-lines-per-function': 'off'
    }
  },
);
