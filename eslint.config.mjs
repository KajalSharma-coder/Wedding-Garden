import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({
  baseDirectory: __dirname
});

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "uploads/**",
      "database/**",
      "css/**",
      "js/**",
      "public/**/*.html",
      "public/js/**",
      "public/sw.js",
      "*.log",
      "next-env.d.ts"
    ]
  },
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      "@next/next/no-img-element": "off",
      "react-hooks/exhaustive-deps": "off"
    }
  }
];

export default eslintConfig;
