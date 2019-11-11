const baseSettings = {
    env: {
        es6: true,
    },
    extends: [
        "airbnb-base",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:@typescript-eslint/all",
        "plugin:fp/recommended",
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2018,
        project: "tsconfig-eslint.json",
        sourceType: "module",
    },
    plugins: [
        "@typescript-eslint",
        "fp",
    ],
    rules: {
        "@typescript-eslint/consistent-type-definitions": ["error", "type"],
        "@typescript-eslint/no-type-alias": "off",
    },
    settings: {
        "import/resolver": {
            node: {
                extensions: ['.ts'],
            },
        },
    },
};

module.exports = {
    ...baseSettings,
    overrides: [
        {
            ...baseSettings,
            files: ["*.spec.ts"],
            rules: {
                ...baseSettings.rules,
                "@typescript-eslint/no-magic-numbers": "off",
                "fp/no-nil": "off",
                "fp/no-unused-expression": "off",
            },
        },
    ],
};
