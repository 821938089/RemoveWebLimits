module.exports = {
    root: true,
    extends: [
        require.resolve('@gera2ld/plaid/eslint'),
        'plugin:prettier/recommended',
    ],
    // 让 prettier 只警告
    rules: { 'prettier/prettier': 'warn', 'no-unused-vars': 'warn' },
    settings: {
        'import/resolver': {
            'babel-module': {},
        },
        react: {
            pragma: 'VM',
        },
    },
    globals: {
        VM: true,
    },
};
