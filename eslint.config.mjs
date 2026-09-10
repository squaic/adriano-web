import { defineConfig, globalIgnores } from "eslint/config";
import { FlatCompat } from "@eslint/eslintrc";
import nextVitals from "eslint-config-next/core-web-vitals.js";
import nextTypescript from "eslint-config-next/typescript.js";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });
const normalizeConfig = (config) => Array.isArray(config) ? config : compat.config(config);

const eslintConfig = defineConfig([
  ...normalizeConfig(nextVitals),
  ...normalizeConfig(nextTypescript),
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
