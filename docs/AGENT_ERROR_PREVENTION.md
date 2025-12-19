# Prevención de Errores Comunes para Agentes IA

Este documento documenta errores comunes que los agentes IA cometen y cómo prevenirlos.

## 🚨 Errores Más Comunes

### 1. Tags JSX Mal Cerrados

**Error:**
```tsx
// ❌ INCORRECTO - Tag no cerrado
<div>
  <Component />
</div>  // Falta cierre

// ❌ INCORRECTO - Etiquetas de cierre duplicadas
<ConfirmDialog />
  </div>  // Extra - no hay div abierto
</div>    // Extra - no hay div abierto

// ❌ INCORRECTO - Etiquetas que no coinciden
<div>
  <span>Content</span>
</div>  // OK
</span>  // ERROR - no hay span abierto
```

**✅ CORRECTO:**
```tsx
// Verifica que cada tag de apertura tenga su cierre correspondiente
<div>
  <Component />
</div>

// Para componentes auto-cerrados, usa />
<ConfirmDialog
  open={true}
  onClose={handleClose}
/>

// Estructura correcta
return (
  <div className="container">
    <Header />
    <Content />
  </div>
);
```

**Prevención:**
- ESLint regla `react/jsx-closing-tag-location` detecta esto
- Siempre verifica que el número de `<` coincida con `>`
- Usa el formateador del editor para ver estructura

### 2. Imports Incorrectos de Iconos

**Error:**
```tsx
// ❌ INCORRECTO - Icono no existe en el paquete
import { ChevronRightIcon } from "@hugeicons/core-free-icons";
// ChevronRightIcon no existe en @hugeicons/core-free-icons

// ❌ INCORRECTO - Import incorrecto
import { Icon } from "lucide-react"; // No existe "Icon"
```

**✅ CORRECTO:**
```tsx
// Para hugeicons - usa HugeiconsIcon wrapper
import { HugeiconsIcon } from "@hugeicons/react";
import { FolderIcon } from "@hugeicons/core-free-icons";

<HugeiconsIcon icon={FolderIcon} size={18} />

// Para lucide-react - importa el icono directamente
import { ChevronRight, ChevronDown } from "lucide-react";

<ChevronRight className="h-4 w-4" />
```

**Prevención:**
- Verifica la documentación del paquete antes de importar
- TypeScript detecta imports incorrectos
- ESLint detecta imports no usados

### 3. Variables No Definidas en JSX

**Error:**
```tsx
// ❌ INCORRECTO
function Component() {
  return <div>{undefinedVariable}</div>; // Variable no definida
}

// ❌ INCORRECTO
function Component() {
  const data = fetchData();
  return <div>{data.value}</div>; // data puede ser null
}
```

**✅ CORRECTO:**
```tsx
// Define todas las variables antes de usar
function Component() {
  const value = "Hello";
  return <div>{value}</div>;
}

// Maneja valores null/undefined
function Component() {
  const data = fetchData();
  return <div>{data?.value ?? "Default"}</div>;
}
```

**Prevención:**
- TypeScript detecta variables no definidas
- ESLint regla `react/jsx-no-undef` detecta esto
- Usa optional chaining (`?.`) y nullish coalescing (`??`)

### 4. Props Duplicados

**Error:**
```tsx
// ❌ INCORRECTO
<Component
  prop1="value1"
  prop1="value2"  // Duplicado
/>
```

**✅ CORRECTO:**
```tsx
<Component
  prop1="value1"
  prop2="value2"
/>
```

**Prevención:**
- ESLint regla `react/jsx-no-duplicate-props` detecta esto automáticamente

### 5. Código Duplicado Después de Ediciones

**Error:**
```tsx
// ❌ INCORRECTO - Código duplicado después de agregar componente
<ConfirmDialog
  open={open}
  onClose={onClose}
/>
  </div>  // Duplicado - ya se cerró arriba
</div>    // Duplicado
```

**✅ CORRECTO:**
```tsx
// Revisa el contexto completo antes de agregar código
return (
  <div>
    <ConfirmDialog
      open={open}
      onClose={onClose}
    />
    {/* Resto del contenido */}
  </div>
);
```

**Prevención:**
- Lee el archivo completo antes de hacer cambios
- Verifica la estructura de JSX antes y después de ediciones
- Usa el formateador para ver estructura clara

### 6. Uso Incorrecto de Hooks

**Error:**
```tsx
// ❌ INCORRECTO - Hook dentro de condición
if (condition) {
  const [state, setState] = useState(); // ERROR
}

// ❌ INCORRECTO - Hook después de return
function Component() {
  return <div>Content</div>;
  const [state, setState] = useState(); // ERROR - inalcanzable
}
```

**✅ CORRECTO:**
```tsx
// Hooks siempre al inicio del componente
function Component() {
  const [state, setState] = useState();

  if (condition) {
    // Lógica condicional aquí
  }

  return <div>Content</div>;
}
```

**Prevención:**
- ESLint regla `react-hooks/rules-of-hooks` detecta esto
- TypeScript detecta código inalcanzable

### 7. Promesas No Manejadas

**Error:**
```tsx
// ❌ INCORRECTO - Promesa no manejada
function handleClick() {
  fetchData(); // No se espera ni maneja error
}

// ❌ INCORRECTO - await sin try/catch
async function handleClick() {
  const data = await fetchData(); // Sin manejo de errores
}
```

**✅ CORRECTO:**
```tsx
// Maneja promesas correctamente
async function handleClick() {
  try {
    const data = await fetchData();
    // Usar data
  } catch (error) {
    console.error(error);
  }
}

// O con .then/.catch
function handleClick() {
  fetchData()
    .then(data => {
      // Usar data
    })
    .catch(error => {
      console.error(error);
    });
}
```

**Prevención:**
- ESLint regla `@typescript-eslint/no-floating-promises` detecta esto
- TypeScript detecta promesas no manejadas

## 📋 Checklist Antes de Hacer Cambios

Antes de modificar cualquier archivo, verifica:

1. ✅ **Lee el archivo completo** - Entiende la estructura antes de cambiar
2. ✅ **Verifica imports** - Asegúrate que los imports existan y sean correctos
3. ✅ **Cuenta tags JSX** - Cada `<` debe tener su `>` correspondiente
4. ✅ **Verifica tipos** - TypeScript debe validar sin errores
5. ✅ **Ejecuta validación** - `npm run validate` antes de commit

## 🔧 Herramientas de Validación

### Validación Automática

```bash
# Validar todo (sin corregir)
npm run validate

# Validar y corregir automáticamente
npm run validate:fix
```

### Validación Manual por Tipo

```bash
# Solo TypeScript
npm run typecheck

# Solo ESLint
npm run lint

# Solo formato
npm run format:check
```

## 🎯 Reglas de ESLint Configuradas

Las siguientes reglas están activas para prevenir errores:

- `react/jsx-no-duplicate-props` - Props duplicados
- `react/jsx-no-undef` - Variables no definidas en JSX
- `react/jsx-closing-tag-location` - Tags mal cerrados
- `react/jsx-tag-spacing` - Espaciado inconsistente
- `@typescript-eslint/no-unused-expressions` - Expresiones no usadas
- `@typescript-eslint/no-floating-promises` - Promesas no manejadas
- `no-unreachable` - Código inalcanzable
- `no-duplicate-imports` - Imports duplicados

## 📝 Ejemplos de Patrones Correctos

### Patrón: Componente con Estado

```tsx
import { useState } from "react";

function MyComponent() {
  // ✅ Hooks al inicio
  const [state, setState] = useState(false);

  // ✅ Handlers
  const handleClick = () => {
    setState(!state);
  };

  // ✅ Return al final
  return (
    <div>
      <button onClick={handleClick}>Toggle</button>
    </div>
  );
}
```

### Patrón: Componente con Props

```tsx
interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

function MyComponent({ title, onAction }: MyComponentProps) {
  return (
    <div>
      <h1>{title}</h1>
      {onAction && (
        <button onClick={onAction}>Action</button>
      )}
    </div>
  );
}
```

### Patrón: Async Handler

```tsx
async function handleSubmit(data: FormData) {
  try {
    const result = await submitData(data);
    if (result) {
      showToast("Success", "success");
    }
  } catch (error) {
    showToast("Error", "error");
    console.error(error);
  }
}
```

## 🚀 Pre-commit Hooks

Los pre-commit hooks ejecutan automáticamente:
1. TypeScript type checking
2. ESLint validation
3. Prettier format check

**Si hay errores, el commit será rechazado.**

Para saltar los hooks (NO recomendado):
```bash
git commit --no-verify -m "mensaje"
```

## 💡 Tips para Agentes IA

1. **Siempre lee el archivo completo** antes de hacer cambios
2. **Verifica la estructura JSX** - cuenta tags de apertura y cierre
3. **Usa TypeScript** - los errores de tipos se detectan en tiempo de compilación
4. **Ejecuta validación** después de cambios grandes
5. **Revisa imports** - verifica que existan en el paquete
6. **Mantén estructura consistente** - sigue los patrones existentes
7. **No dupliques código** - revisa antes y después de ediciones

## 📚 Referencias

- [React ESLint Rules](https://github.com/jsx-eslint/eslint-plugin-react)
- [TypeScript ESLint Rules](https://typescript-eslint.io/rules/)
- [React Hooks Rules](https://react.dev/reference/rules/rules-of-hooks)
