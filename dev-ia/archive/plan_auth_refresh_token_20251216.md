# Plan de Desarrollo - Auth Refresh Token - Frontend

**Duración estimada:** 2 días (16 horas)
**Fecha inicio:** 2025-12-16
**Fecha fin estimada:** 2025-12-18
**Feature/Módulo:** Auth Refresh Token (Fase 0 - Ajustes Base)
**Prioridad:** Alta (infraestructura base)

---

## 📋 Objetivo

Implementar renovación automática de access tokens usando refresh tokens en el frontend, mejorando la experiencia de usuario al evitar deslogueos inesperados.

---

## 🔍 Análisis del Estado Actual

### Backend Disponible ✅
- Endpoint `/api/v1/auth/refresh` disponible según `rules/auth-rbac.md`
- Endpoint `/api/v1/auth/login` retorna `access_token` y `refresh_token`
- Endpoint `/api/v1/auth/logout` invalida refresh token

### Frontend Actual
- `apiClient` (`app/lib/api/client.ts`): Solo maneja access token, redirige a login en 401
- `authStore` (`app/stores/authStore.ts`): Solo guarda access token, no maneja refresh token
- No hay lógica de renovación automática

### Requisitos
- Renovar access token automáticamente cuando expire (401)
- Guardar refresh token de forma segura
- Manejar casos edge (refresh token expirado, múltiples requests simultáneos)
- Tests unitarios y E2E

---

## 📅 Plan de Ejecución

### Día 1 (8 horas)

#### Fase 1: Tipos y Configuración (2 horas)
- [ ] Crear tipos TypeScript para tokens (`app/lib/api/types/auth.types.ts`)
  - `TokenResponse` (access_token, refresh_token, token_type)
  - `RefreshTokenResponse` (access_token, token_type)
- [ ] Verificar configuración de expiración de tokens (15 min access, 7 días refresh)
- [ ] Verificar: typecheck pasa sin errores

#### Fase 2: Actualizar AuthStore (2 horas)
- [ ] Agregar `refreshToken` al estado de `authStore`
- [ ] Agregar método `setRefreshToken(refreshToken: string)`
- [ ] Agregar método `refreshAccessToken()` que llama al endpoint
- [ ] Actualizar `setAuth` para guardar ambos tokens
- [ ] Actualizar `clearAuth` para limpiar ambos tokens
- [ ] Verificar: typecheck y lint pasan

#### Fase 3: Implementar Lógica de Refresh en apiClient (3 horas)
- [ ] Crear función `refreshAccessToken()` que llama a `/api/v1/auth/refresh`
- [ ] Implementar cola de requests pendientes durante refresh
- [ ] Actualizar interceptor de respuesta para detectar 401
- [ ] Implementar lógica de renovación automática:
  - Si 401 y hay refresh token → intentar renovar
  - Si renovación exitosa → reintentar request original
  - Si renovación falla → logout y redirigir a login
- [ ] Manejar casos edge:
  - Múltiples requests simultáneos (solo un refresh a la vez)
  - Refresh token expirado (logout)
  - Errores de red durante refresh
- [ ] Verificar: typecheck y lint pasan

#### Fase 4: Integración y Pruebas Manuales (1 hora)
- [ ] Probar flujo completo:
  - Login → guardar tokens
  - Request con access token válido
  - Request con access token expirado → renovación automática
  - Logout → limpiar tokens
- [ ] Verificar: integración funciona correctamente

---

### Día 2 (8 horas)

#### Fase 5: Tests Unitarios (3 horas)
- [ ] Tests para `authStore`:
  - `setAuth` guarda ambos tokens
  - `refreshAccessToken` renueva token correctamente
  - `clearAuth` limpia ambos tokens
- [ ] Tests para `apiClient`:
  - Interceptor renueva token en 401
  - Cola de requests funciona correctamente
  - Múltiples requests simultáneos solo hacen un refresh
  - Refresh token expirado hace logout
- [ ] Verificar: tests pasan (cobertura > 80%)

#### Fase 6: Tests E2E (2 horas)
- [ ] Test E2E flujo completo:
  - Login → verificar tokens guardados
  - Hacer request → verificar access token usado
  - Simular expiración → verificar renovación automática
  - Logout → verificar tokens limpiados
- [ ] Verificar: tests E2E pasan

#### Fase 7: Verificación Final (2 horas)
- [ ] Ejecutar typecheck completo
- [ ] Ejecutar lint completo
- [ ] Ejecutar tests unitarios (cobertura > 80%)
- [ ] Ejecutar tests E2E
- [ ] Verificar accesibilidad (si aplica)
- [ ] Verificar integración con backend
- [ ] Documentar cambios

#### Fase 8: Documentación y Limpieza (1 hora)
- [ ] Actualizar documentación si es necesario
- [ ] Comentarios JSDoc en funciones complejas
- [ ] Actualizar archivo de seguimiento con métricas finales
- [ ] Clasificar y documentar warnings (si hay)

---

## ✅ Criterios de Éxito

- [ ] Access token se renueva automáticamente cuando expira
- [ ] Refresh token se guarda y usa correctamente
- [ ] Múltiples requests simultáneos no causan múltiples refreshes
- [ ] Refresh token expirado hace logout correctamente
- [ ] 0 errores TypeScript
- [ ] 0 errores ESLint críticos
- [ ] Tests unitarios pasan (cobertura > 80%)
- [ ] Tests E2E pasan
- [ ] Integración con backend verificada

---

## 📚 Referencias

- Backend: `rules/auth-rbac.md` - Endpoints y especificaciones
- Frontend: `app/lib/api/client.ts` - Cliente HTTP actual
- Frontend: `app/stores/authStore.ts` - Store de autenticación actual
- API Contract: `rules/api-contract.md` - Formato de respuestas

---

## 🎯 Próximas Features

Después de completar Auth Refresh Token:
- Permisos en UI (guards y componentes condicionales)
- Layout Principal (AppShell)
- Dashboard personalizado por rol
