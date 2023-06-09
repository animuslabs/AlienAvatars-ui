module.exports = {
  // https://eslint.org/docs/user-guide/configuring#configuration-cascading-and-hierarchy
  // This option interrupts the configuration hierarchy at this file
  // Remove this if you have an higher level ESLint config file (it usually happens into a monorepos)
  root: true,

  // https://eslint.vuejs.org/user-guide/#how-to-use-a-custom-parser
  // Must use parserOptions instead of "parser" to allow vue-eslint-parser to keep working
  // `parser: 'vue-eslint-parser'` is already included with any 'plugin:vue/**' config and should be omitted
  parserOptions: {
    parser: require.resolve('@typescript-eslint/parser'),
    extraFileExtensions: ['.vue'],
    project: ['./tsconfig.json']
  },

  env: {
    browser: true,
    es2021: true,
    node: true,
    'vue/setup-compiler-macros': true
  },
  globals: {
    "fetch": true
  },
  // Rules order is important, please avoid shuffling them
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-strongly-recommended', // Priority B: Strongly Recommended (Improving Readability)
    // 'standard',
  ],

  plugins: [
    '@typescript-eslint',
    'vue'
  ],

  globals: {
    ga: 'readonly', // Google Analytics
    cordova: 'readonly',
    __statics: 'readonly',
    __QUASAR_SSR__: 'readonly',
    __QUASAR_SSR_SERVER__: 'readonly',
    __QUASAR_SSR_CLIENT__: 'readonly',
    __QUASAR_SSR_PWA__: 'readonly',
    process: 'readonly',
    Capacitor: 'readonly',
    chrome: 'readonly'
  },

  // add your custom rules here
  rules: {
    'no-return-assign': "off",
    "@typescript-eslint/ban-ts-comment": "off",
    'no-useless-return': 'off',
    // allow async-await
    'generator-star-spacing': 'off',
    // allow paren-less arrow functions
    'arrow-parens': 'off',
    'one-var': 'off',
    'no-void': 'off',
    'multiline-ternary': 'off',
    '@typescript-eslint/no-empty-function': 'warn',
    // The core 'import/named' rules
    // does not work with type definitions
    'import/named': 'off',
    'prefer-promise-reject-errors': 'off',
    quotes: ['warn', 'single', { avoidEscape: true }],

    // this rule, if on, would require explicit return type on the `render` function
    '@typescript-eslint/explicit-function-return-type': 'off',

    // in plain CommonJS modules, you can't use `import foo = require('foo')` to pass this rule, so it has to be disabled
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    "@typescript-eslint/no-unsafe-member-access": "error",
    'promise/param-names': "off",
    // The core 'no-unused-vars' rules (in the eslint:recommeded ruleset)
    // does not work with type definitions
    'no-unused-vars': 'off',
    "prefer-const": "off",
    'space-before-function-paren': ['error', 'never'],
    // allow debugger during development only
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'camelcase': 'off',
    'no-unreachable': 'off',
    "@typescript-eslint/no-floating-promises": [
      "error"
    ],
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        "checksVoidReturn": false,
        "checksConditionals": true
      }
    ],
  }
}
