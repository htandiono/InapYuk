import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      'max-lines': ['warn', { max: 200, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 15, skipBlankLines: true, skipComments: true }],
    }
  },
  {
    files: ['src/components/ui/**', '__tests__/**'],
    rules: {
      'max-lines-per-function': 'off'
    }
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Local scripts using CommonJS require()
    'audit.js',
    'coverage/**',
  ]),
]);

export default eslintConfig;
