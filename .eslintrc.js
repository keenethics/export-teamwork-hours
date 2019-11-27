module.exports = {
  parser: 'babel-eslint',
  env: {
    browser: true,
    commonjs: true,
    es6: true
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 2015
  },
  env: {
    node: true
  },
  rules: {
    indent: [
      'error',
      2,
      {
        ignoredNodes: ['TemplateLiteral']
      }
    ],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'always']
  }
};
