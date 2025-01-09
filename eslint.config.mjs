import globals from "globals";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";


/** @type {import('eslint').Linter.Config[]} */
export default [

  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node,
    },
    plugins: {
      "@typescript-eslint": tseslint
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "warn",
      "no-unused-vars": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-empty-function": "warn",
      "indent": [
        "warn",
        4
      ],
      "quotes": [
        "warn",
        "double",
        {
          allowTemplateLiterals: true,
        }
      ],
      "semi-style": ["warn", "last"],
      "max-len": [
        "warn",
        {
          code: 200,
        },
      ],
      "no-irregular-whitespace": "warn",
      "no-trailing-spaces": "warn",
      "no-multi-spaces": "warn",
    },
  },
];