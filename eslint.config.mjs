import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    files: ["**/*.js"], // Define file patterns
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.node, // Add Node.js globals
        ...globals.browser, // Add browser globals if needed
      },
    },
    rules: {
      // Add your custom rules here
      "no-useless-catch": "off"
    },
  },
  pluginJs.configs.recommended, // Extend recommended rules
];
