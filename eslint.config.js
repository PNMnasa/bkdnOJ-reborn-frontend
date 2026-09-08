const js = require("@eslint/js");
const globals = require("globals");
const tsParser = require("@typescript-eslint/parser");
const tseslint = require("@typescript-eslint/eslint-plugin");
const reactPlugin = require("eslint-plugin-react");
const unusedImports = require("eslint-plugin-unused-imports");

const reactRules = {
  ...reactPlugin.configs.flat.recommended.rules,
  ...reactPlugin.configs.flat["jsx-runtime"].rules,
};

module.exports = [
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    settings: {
      react: {
        version: "18.3.1",
      },
    },
    plugins: {
      react: reactPlugin,
      "@typescript-eslint": tseslint,
      "unused-imports": unusedImports,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactRules,
      "react/prop-types": "off",
      "no-useless-escape": "off",
      "react/no-unescaped-entities": "off",
      "no-prototype-builtins": "off",
      "no-undef": "off",
      "getter-return": "off",
      "valid-typeof": "off",
      "no-cond-assign": "off",
      "no-empty": "off",
      "no-func-assign": "off",
      "no-unsafe-finally": "off",
      "no-useless-catch": "off",
      "react/display-name": "off",
      "no-control-regex": "off",
      "no-fallthrough": "off",
      "no-unused-vars": "off",
      "no-constant-binary-expression": "off",
      "no-useless-assignment": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { args: "none", varsIgnorePattern: "^_", caughtErrors: "none" },
      ],
    },
  },
];