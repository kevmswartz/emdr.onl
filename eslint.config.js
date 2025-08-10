import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import * as parserVue from 'vue-eslint-parser'
import configPrettier from '@vue/eslint-config-prettier'
import pluginVitest from 'eslint-plugin-vitest'
import tseslint from '@typescript-eslint/eslint-plugin'
import parserTs from '@typescript-eslint/parser'

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}']
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**']
  },

  js.configs.recommended,

  ...pluginVue.configs['flat/recommended'],
  {
    ...tseslint.configs.recommended,
    files: ['**/*.{ts,tsx,vue}']
  },

  {
    languageOptions: {
      ecmaVersion: 'latest',
      parser: parserVue,
      parserOptions: {
        parser: {
          ts: parserTs
        }
      }
    }
  },

  {
    files: ['**/__tests__/**', '**/*.test.{js,ts}'],
    plugins: {
      vitest: pluginVitest
    },
    rules: {
      ...pluginVitest.configs.recommended.rules
    }
  },

  configPrettier,

  {
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
      'vue/no-unused-vars': 'error'
    }
  }
]