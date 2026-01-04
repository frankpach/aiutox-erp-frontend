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
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/await-thenable": "error",
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
      "react/no-unescaped-entities": "error", // Previene caracteres sin escapar
      "react/self-closing-comp": "error", // Fuerza componentes auto-cerrados cuando es posible
      "react/jsx-closing-bracket-location": ["error", "line-aligned"], // Consistencia en cierre de tags
      "react/jsx-closing-tag-location": "error", // Consistencia en ubicación de tags de cierre
      "react/jsx-curly-spacing": ["error", { when: "never", children: true }], // Consistencia en espacios
      "react/jsx-equals-spacing": ["error", "never"], // Sin espacios alrededor de =
      "react/jsx-indent": ["error", 2], // Indentación consistente
      "react/jsx-indent-props": ["error", 2], // Indentación de props
      "react/jsx-max-props-per-line": ["error", { maximum: 1, when: "multiline" }], // Props por línea
      "react/jsx-tag-spacing": ["error", {
        closingSlash: "never",
        beforeSelfClosing: "always",
        afterOpening: "never",
        beforeClosing: "never"
      }], // Espaciado consistente en tags
      "react/jsx-wrap-multilines": ["error", {
        declaration: "parens-new-line",
        assignment: "parens-new-line",
        return: "parens-new-line",
        arrow: "parens-new-line",
        condition: "parens-new-line",
        logical: "parens-new-line",
        prop: "parens-new-line"
      }], // Wrapping consistente en JSX multilínea

      // TypeScript rules más estrictas
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-expressions": "error",
      "@typescript-eslint/no-floating-promises": "warn", // Detecta promesas no manejadas
      "@typescript-eslint/no-misused-promises": "error", // Previene uso incorrecto de promesas
      "@typescript-eslint/await-thenable": "error", // Previene await en valores no promesas
      "@typescript-eslint/no-unnecessary-type-assertion": "warn", // Detecta type assertions innecesarias

      // Reglas generales para prevenir errores
      "no-console": ["warn", { allow: ["warn", "error"] }], // Solo warn/error en console
      "no-debugger": "error", // No debugger en producción
      "no-duplicate-imports": "error", // Previene imports duplicados
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
  prettier, // Must be last to override other configs
  {
    ignores: [
      "node_modules/**",
      "build/**",
      "dist/**",
      ".react-router/**",
      "**/*.config.js",
      "**/*.config.ts",
    ],
  },
];

