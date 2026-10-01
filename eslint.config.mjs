import js from "@eslint/js";
import { fileURLToPath } from "node:url";
import ts from "typescript-eslint";
import globals from "globals";
import next from "@next/eslint-plugin-next";
import hooks from "eslint-plugin-react-hooks";
export default ts.config(
  {
    ignores: [
      "**/dist/**",
      "**/.next/**",
      "**/coverage/**",
      "**/node_modules/**",
      "**/next-env.d.ts",
      "test-results/**",
      "playwright-report/**",
    ],
  },
  {
    plugins: { "@next/next": next, "react-hooks": hooks },
    settings: {
      next: { rootDir: fileURLToPath(new URL("./apps/web/", import.meta.url)) },
    },
    rules: {
      ...next.configs.recommended.rules,
      ...hooks.configs.recommended.rules,
    },
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.browser, ...globals.jest },
    },
    rules: { "@typescript-eslint/no-explicit-any": "error" },
  },
);
