import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import testingLibrary from "eslint-plugin-testing-library";

export default tseslint.config(
  { ignores: ["dist", "dev-dist", "coverage"] },
  js.configs.recommended,
  tseslint.configs.recommended,
  reactRefresh.configs.vite,
  reactHooks.configs["recommended-latest"],
  {
    ...testingLibrary.configs["flat/react"],
    files: ["tests/**/*.{ts,tsx}"],
    rules: {
      "testing-library/render-result-naming-convention": "off",
    },
  },
  eslintConfigPrettier,
);
