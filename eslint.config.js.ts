import babelParser from '@babel/eslint-parser';
import eslintPluginNuxt from 'eslint-plugin-nuxt';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintPluginVue from 'eslint-plugin-vue';

export default [
  {
    files: ['**/*.{js,ts,vue}'], // Target JavaScript, TypeScript, and Vue files
    ignores: ['node_modules/**', 'dist/**', '.output/**'], // Ignore common output directories

    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        _: 'readonly', // Define `_` as a global variable
      },
    },

    plugins: {
      nuxt: eslintPluginNuxt,
      prettier: eslintPluginPrettier,
      vue: eslintPluginVue,
    },

    rules: {
      'prettier/prettier': ['error'], // Prettier formatting rules
      'no-console': 'off', // Allow console statements
      'vue/html-indent': ['error', 4], // Enforce 4 spaces for indentation
      'vue/singleline-html-element-content-newline': 'off', // Disable content newline rule
      'vue/component-name-in-template-casing': ['error', 'PascalCase'], // Enforce PascalCase for component names
      'vue/valid-v-slot': [
        'error',
        {
          allowModifiers: true, // Allow modifiers in Vue v-slot
        },
      ],
    },
  },
  {
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
];
