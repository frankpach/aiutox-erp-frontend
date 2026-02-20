import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-misused-promises": "warn",
      "@typescript-eslint/await-thenable": "warn",
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // Not needed in React 17+
      "react/prop-types": "off", // Using TypeScript for prop validation

      // Reglas estrictas para prevenir errores comunes de JSX
      "react/jsx-no-duplicate-props": "error", // Previene props duplicados
      "react/jsx-no-undef": "error", // Previene variables no definidas en JSX
      "react/jsx-uses-react": "off", // Not needed in React 17+
      "react/jsx-uses-vars": "error", // Detecta variables no usadas en JSX
      "react/no-unescaped-entities": "warn", // Previene caracteres sin escapar
      "react/self-closing-comp": "warn", // Fuerza componentes auto-cerrados cuando es posible
      "react/display-name": "warn", // Nombre de componente para debugging
      "react/jsx-closing-bracket-location": ["warn", "line-aligned"], // Consistencia en cierre de tags
      "react/jsx-closing-tag-location": "warn", // Consistencia en ubicación de tags de cierre
      "react/jsx-curly-spacing": ["warn", { when: "never", children: true }], // Consistencia en espacios
      "react/jsx-equals-spacing": ["warn", "never"], // Sin espacios alrededor de =
      "react/jsx-indent": ["warn", 2], // Indentación consistente
      "react/jsx-indent-props": ["warn", 2], // Indentación de props
      "react/jsx-max-props-per-line": ["warn", { maximum: 1, when: "multiline" }], // Props por línea
      "react/jsx-tag-spacing": ["warn", {
        closingSlash: "never",
        beforeSelfClosing: "always",
        afterOpening: "never",
        beforeClosing: "never"
      }], // Espaciado consistente en tags
      "react/jsx-wrap-multilines": ["warn", {
        declaration: "parens-new-line",
        assignment: "parens-new-line",
        return: "parens-new-line",
        arrow: "parens-new-line",
        condition: "parens-new-line",
        logical: "parens-new-line",
        prop: "parens-new-line"
      }], // Wrapping consistente en JSX multilínea

      // TypeScript rules más estrictas
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-expressions": "error",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/await-thenable": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "warn", // Detecta type assertions innecesarias
      "@typescript-eslint/no-this-alias": "warn", // Alias de this
      "@typescript-eslint/no-empty-object-type": "warn", // Interfaces vacías

      // Reglas generales para prevenir errores
      "no-console": "off", // Desactivado - proyecto en desarrollo activo
      "no-debugger": "error", // No debugger en producción
      "no-duplicate-imports": "warn", // Previene imports duplicados
      "no-case-declarations": "warn", // Declaraciones en case blocks
      "no-control-regex": "warn", // Control chars en regex
      "no-useless-escape": "warn", // Escapes innecesarios
      "no-unused-expressions": "off", // Desactivado porque TypeScript lo maneja mejor
      "no-unreachable": "error", // Detecta código inalcanzable
      "no-unused-labels": "error", // Detecta labels no usados
      "no-useless-return": "error", // Detecta returns innecesarios
      "no-var": "error", // Fuerza uso de let/const
      "prefer-const": "error", // Prefiere const cuando es posible
      "prefer-arrow-callback": "warn", // Prefiere arrow functions
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  // Overrides for test files - relax rules that don't apply in test context
  {
    files: [
      "**/__tests__/**/*.{ts,tsx}",
      "**/*.spec.{ts,tsx}",
      "**/*.test.{ts,tsx}",
      "**/fixtures/**/*.{ts,tsx}",
      "**/helpers/**/*.{ts,tsx}",
    ],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/await-thenable": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "react/display-name": "off",
    },
  },
  prettier, // Must be last to override other configs
  {
    ignores: [
      "node_modules/**",
      "build/**",
      "dist/**",
      ".react-router/**",
      "actions-runner/**",
      "**/*.config.js",
      "**/*.config.ts",
    ],
  },
];

