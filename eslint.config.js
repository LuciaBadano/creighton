import js from "@eslint/js";
import globals from "globals";
// import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { files: ["**/*.js"], languageOptions: { globals: globals.browser } },
  { files: ["**/*.js"], plugins: { js }, extends: ["js/recommended"] },
  {
    rules: {
      "react/prop-types": "off",
    },
  },
]);
