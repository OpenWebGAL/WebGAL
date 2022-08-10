module.exports = {
  extends: ['alloy', 'alloy/react', 'alloy/typescript', 'plugin:prettier/recommended'],
  env: {
    // 你的环境变量（包含多个预定义的全局变量）
    //
    // browser: true,
    // node: true,
    // mocha: true,
    // jest: true,
    // jquery: true
  },
  globals: {
    // 你的全局变量（设置为 false 表示它不允许被重新赋值）
    //
    // myGlobal: false
  },
  rules: {
    // 自定义你的规则
    // 最大圈复杂度
    complexity: ['error', 30],
    'linebreak-style': ['error', 'unix'],
    semi: 2,
    // indent: ['error', 2],
    'semi-style': ['error', 'last'],
    'react/jsx-no-useless-fragment': [
      'error',
      {
        allowExpressions: true,
      },
    ],
  },
};
