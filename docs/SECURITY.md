# Seguridad del Sistema de Cifrado

## Descripción

El sistema implementa cifrado local usando Web Crypto API (AES-GCM) para proteger datos sensibles almacenados en localStorage.

## Características de Seguridad

### Algoritmo de Cifrado

- **Algoritmo**: AES-GCM (Advanced Encryption Standard - Galois/Counter Mode)
- **Longitud de clave**: 256 bits
- **Derivación de clave**: PBKDF2 con 100,000 iteraciones
- **Hash**: SHA-256

### Gestión de Claves

- Las claves se derivan de `tenant_id + secret`
- Cada usuario tiene cifrado independiente
- El secret debe almacenarse de forma segura (actualmente desde variable de entorno)

### TTL y Expiración

- **TTL por defecto**: 30 días
- Limpieza automática de datos expirados
- Verificación de expiración en cada lectura

### Datos Cifrados

Los siguientes datos se almacenan cifrados:

1. **Metadata de módulos** (`modules:{userId}`)
2. **Datos de usuario** (`user:{userId}`)
3. **Lista de módulos** (`module_list:{userId}`)

## Verificación de Seguridad

### Checklist de Seguridad

- ✅ Uso de AES-GCM (autenticado)
- ✅ Derivación de clave con PBKDF2
- ✅ TTL de 30 días implementado
- ✅ Limpieza automática de datos expirados
- ✅ Verificación de expiración en lectura
- ⚠️ Secret actualmente desde variable de entorno (debe mejorarse en producción)

### Mejoras Recomendadas para Producción

1. **Gestión de Secret**:
   - Obtener secret del backend después del login
   - Rotar secret periódicamente
   - No almacenar secret en código

2. **Validación de Integridad**:
   - Verificar integridad de datos antes de usar
   - Implementar checksums adicionales

3. **Auditoría**:
   - Registrar intentos de acceso a datos expirados
   - Monitorear fallos de descifrado

## Uso

```typescript
import { setEncrypted, getEncrypted } from "~/lib/storage/encryptedStorage";

// Cifrar y almacenar
await setEncrypted("my-key", data, tenantId, secret);

// Obtener y descifrar
const data = await getEncrypted<MyType>("my-key", tenantId, secret);
```

## Limpieza Automática

La limpieza de datos expirados se ejecuta automáticamente:

- Al inicializar módulos (`initializeModules`)
- Al cargar módulos (`loadModules`)
- Manualmente con `clearExpiredCache()`

