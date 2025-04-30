import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import testingLibrary from "eslint-plugin-testing-library";

export default tseslint.config(
  { ignores: ["dist", "dev-dist", "coverage"] },
  reactRefresh.configs.vite,
  reactHooks.configs["recommended-latest"],
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    ...testingLibrary.configs["flat/react"],
    files: ["tests/**/*.{ts,tsx}"],
    rules: {
      "testing-library/render-result-naming-convention": "off",
    },
  },
  eslintConfigPrettier,
);
