module.exports = {
    root: true,
    env: {
        es6: true,
        node: true,
    },
    parserOptions: {
        ecmaVersion: 2020,
    },
    extends: [
        'eslint:recommended'
    ],
    rules: {
        'indent': ['error', 4],
        'object-curly-spacing': ['error', 'always'],
        'max-len': ['error', { 'code': 120 }],
        'no-unused-vars': ['warn'],
        'quotes': ['error', 'single'],
        'semi': ['error', 'always'],
        'no-control-regex': 'off',
    },
};