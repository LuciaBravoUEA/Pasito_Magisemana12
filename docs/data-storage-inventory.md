# Inventario y almacenamiento local

## Datos manejados

| Clase | Datos | Naturaleza | Almacenamiento | Finalidad | Retención |
| --- | --- | --- | --- | --- | --- |
| Autenticación | Token de sesión Bearer | Sensible | `@aparajita/capacitor-secure-storage` (Keystore/Keychain) | Mantener la sesión nativa | Hasta logout, revocación o expiración |
| Identidad | Nombre, correo y roles recibidos en sesión | Personal no secreto | Estado en memoria de Zustand/React Query | Mostrar la cuenta y adaptar la interfaz | Solo durante la sesión |
| Rutinas | Título, descripción, categoría, puntos y estado | Personal de bajo riesgo | Caché JSON versionada en `@capacitor/preferences` | Lectura offline y continuidad de la interfaz | 24 horas; se reemplaza al sincronizar y se borra al cerrar sesión |
| Operaciones pendientes | Solicitud de creación, UUID local, intentos y marcas locales | Datos funcionales no sensibles | `@capacitor/preferences` | Reintentar operaciones offline | Hasta sincronización, 5 fallos o logout |
| Evidencia local | Referencia `webPath` de una foto seleccionada | Dato personal potencial | `@capacitor/preferences` | Mostrar evidencia elegida en el dispositivo | Hasta logout o limpieza local |
| Preferencias | Tema, idioma y configuración visual | No sensible | `@capacitor/preferences` | Personalizar la experiencia | Hasta que la persona la cambie o borre datos |

No se guardan contraseñas, tokens, cookies, logs de autorización ni datos que la interfaz no muestre. El cierre de sesión elimina el token cifrado y todas las claves locales registradas por la aplicación.

## Base local y mantenimiento

La aplicación usa `@capacitor/preferences` como almacén local estructurado de pequeño volumen. La elección reduce mantenimiento nativo en Android/iOS, no requiere migraciones SQL ni una conexión adicional, y es suficiente mientras el dominio local sea una caché acotada de rutinas y una outbox pequeña. Cada registro de caché incluye `schemaVersion`; la versión actual es `1` y los lectores rechazan estructuras incompatibles sin destruir datos.

Si el volumen crece, aparecen consultas relacionales o la outbox supera el tamaño razonable de preferencias, la migración prevista es SQLite mediante un adaptador de `services/storage/` que conserve la interfaz del repositorio. No se mezclan mecanismos en la misma feature.

## Sincronización y conflictos

La fecha `lastSyncedAt` de la caché se toma de la respuesta exitosa recibida; no se inventa una marca de reconciliación del dispositivo. Las creaciones offline reciben `crypto.randomUUID()` y se reenvían como operaciones únicas. El servidor es la autoridad: si una operación entra en conflicto, se conserva el estado del servidor y se descarta la intención local después del máximo de cinco intentos. Esto sacrifica cambios locales no aceptados para evitar duplicados o sobrescrituras silenciosas.

La cola usa espera creciente de `500 ms`, `1 s`, `2 s`, `4 s` y `8 s`. Solo se reintentan operaciones pendientes; las peticiones `GET` siguen su política independiente de backoff.

## Modo avión

La prueba manual debe ejecutarse en el emulador: abrir `Rutinas` con una caché previa, activar modo avión, confirmar que se muestra la última lista y el indicador “datos desactualizados”, crear una rutina y comprobar que queda pendiente; desactivar modo avión y confirmar que la cola se sincroniza y el indicador se actualiza. La evidencia se registra en `docs/evidence/offline-mode.md`.