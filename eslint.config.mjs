import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Transitional compatibility layer between the typed legacy GameState and the
    // approved multi-floor/world-system extensions. Keep this exception scoped to
    // these modules only. Remove it when the shared world contracts replace the
    // legacy ZoneId/GameState boundary.
    files: [
      "app/game-engine.ts",
      "app/game-region-map-544.ts",
      "app/game-region-state-544.ts",
      "app/game-region-tick-544.ts",
      "app/game-world-systems.ts",
      "app/world-navigation-overlay.tsx",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
