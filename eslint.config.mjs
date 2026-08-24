import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  // -------------------------------------------------------------------------
  // Global ignores
  // -------------------------------------------------------------------------
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.vite/**',
      '**/.turbo/**',
      '**/.pnpm-store/**',
    ],
  },

  // -------------------------------------------------------------------------
  // Base JavaScript rules
  // -------------------------------------------------------------------------
  js.configs.recommended,

  // -------------------------------------------------------------------------
  // TypeScript - shared between API and Web
  // -------------------------------------------------------------------------
  ...tseslint.configs.recommended,

  // -------------------------------------------------------------------------
  // API / SDK - Node environment
  // -------------------------------------------------------------------------
  {
    files: [
      'api/**/*.{ts,tsx}',
      'packages/sdk-node/**/*.{ts,tsx}',
      'demo/**/*.{ts,tsx}',
    ],

    languageOptions: {
      globals: {
        ...globals.node,
      },
    },

    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // -------------------------------------------------------------------------
  // Web - React / Browser environment
  // -------------------------------------------------------------------------
  {
    files: ['web/**/*.{ts,tsx}'],

    languageOptions: {
      ecmaVersion: 'latest',

      globals: {
        ...globals.browser,
      },

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },

    rules: {
      ...reactHooks.configs.recommended.rules,

      'react-refresh/only-export-components': [
        'warn',
        {
          allowConstantExport: true,
        },
      ],

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // -------------------------------------------------------------------------
  // Config files - Node environment
  // -------------------------------------------------------------------------
  {
    files: [
      '*.config.{js,mjs,cjs,ts}',
      '**/*.config.{js,mjs,cjs,ts}',
      '**/vite.config.ts',
    ],

    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  // -------------------------------------------------------------------------
  // Tests
  // -------------------------------------------------------------------------
  {
    files: [
      '**/*.test.{js,ts,tsx}',
      '**/*.spec.{js,ts,tsx}',
      '**/__tests__/**/*.{js,ts,tsx}',
    ],

    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // Keep Prettier responsible for formatting rules.
  prettierConfig,
);
