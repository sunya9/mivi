import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import testingLibrary from "eslint-plugin-testing-library";
import vitest from "@vitest/eslint-plugin";

export default tseslint.config(
  { ignores: ["dist", "dev-dist", "coverage", "eslint.config.js"] },
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  reactRefresh.configs.vite,
  reactHooks.configs["recommended-latest"],
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        projectService: true,
      },
    },
    rules: {
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          // allow onClick={() => Promise<void>}
          checksVoidReturn: {
            attributes: false,
          },
        },
      ],
      // for `expect.anything`
      "@typescript-eslint/no-unsafe-assignment": "off",
      // for `expect(location.reload)`
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/only-throw-error": [
        "error",
        {
          // for suspense
          allow: ["Promise"],
        },
      ],
      "@typescript-eslint/prefer-promise-reject-errors": [
        "error",
        {
          // allow reject(<any>)
          allowThrowingAny: true,
        },
      ],
    },
  },
  {
    files: ["tests/**"],
    plugins: { vitest },
    settings: {
      vitest: {
        typecheck: true,
      },
    },
    rules: vitest.configs.recommended.rules,
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
