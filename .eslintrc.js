module.exports = {
    env: {
        node: true,
        es6: true,
    },
    extends: ["prettier", "eslint:recommended"],
    parserOptions: {
        ecmaVersion: 12,
    },
    plugins: ["prettier"],
    rules: {
        // no-unused-vars
        "no-unused-vars": [
            "error",
            {
                argsIgnorePattern: "^_",
            },
        ],
        // prettier/prettier
        "prettier/prettier": "error",
    },
};
