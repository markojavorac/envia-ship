import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import noAdminHardcodedColors from "./eslint-rules/no-admin-hardcoded-colors.js";
import noInlineStyles from "./eslint-rules/no-inline-styles.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "node_modules/**",
      "coverage/**",
      ".playwright/**",
    ],
  },
  ...compat.extends("next/core-web-vitals"),

  // Custom ESLint Rules for Admin Styling Enforcement
  {
    plugins: {
      "custom": {
        rules: {
          "no-admin-hardcoded-colors": noAdminHardcodedColors,
          "no-inline-styles": noInlineStyles,
        },
      },
    },
    rules: {
      "custom/no-admin-hardcoded-colors": "error",
      "custom/no-inline-styles": "error",
    },
  },
];

export default eslintConfig;
