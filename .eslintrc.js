module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
  ],
  rules: {
    semi: [2, 'always'],
    quotes: [2, 'single'],
    'no-unused-expressions': ['error', { allowTernary: true, allowShortCircuit: true }],
  },
};
