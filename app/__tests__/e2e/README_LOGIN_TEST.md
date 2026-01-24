# Test de Login y Layout - Guía de Ejecución

## Prerequisitos

Antes de ejecutar el test `login-layout.spec.ts`, asegúrate de que:

### 1. Servidor Frontend esté corriendo

```bash
cd frontend
npm run dev
```

El servidor debe estar disponible en `http://127.0.0.1:3000`

### 2. Servidor Backend esté corriendo

El backend debe estar disponible en `http://localhost:8000` (o la URL configurada en `VITE_API_BASE_URL`)

**Para iniciar el backend con Python:**

```bash
cd backend

# Opción 1: Usando uv (recomendado)
uv run fastapi dev app/main.py
# O
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Opción 2: Usando Python directamente
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Ver más detalles en `docs/10-backend/temp/2026-01-14-iniciar-servidor.md`

### 3. Usuario Admin exista

El test usa las credenciales del usuario admin:
- **Email:** `admin@aiutox.com`
- **Contraseña:** `password`

Si el usuario no existe, créalo en el backend o usa otro usuario con permisos adecuados.

## Ejecutar el Test

### Modo Headed (ver el navegador)

```bash
cd frontend
npx playwright test login-layout.spec.ts --project=chromium --headed
```

### Modo Headless (sin navegador visible)

```bash
cd frontend
npx playwright test login-layout.spec.ts --project=chromium
```

## Qué prueba el test

1. **Login exitoso:** Verifica que el login funciona con credenciales válidas
2. **Layout completo:** Verifica que Header, Sidebar, MainContent y Footer se muestran después del login
3. **Navegación:** Verifica que los items del sidebar funcionan
4. **User Menu:** Verifica que el menú de usuario se abre y muestra opciones
5. **Logout:** Verifica que el logout funciona correctamente
6. **Credenciales inválidas:** Verifica que se muestra error con credenciales incorrectas

## Solución de Problemas

### Error: "Frontend server is not running"

**Solución:** Inicia el servidor frontend:
```bash
cd frontend
npm run dev
```

### Error: "Connection refused"

**Solución:** Verifica que el servidor esté corriendo en el puerto correcto (3000 por defecto)

### Error: "Invalid credentials"

**Solución:** Verifica que el usuario `admin@aiutox.com` exista en el backend con la contraseña `password`

### Error: Timeout en navegación

**Solución:** Aumenta el timeout o verifica que el backend responda correctamente al login


























