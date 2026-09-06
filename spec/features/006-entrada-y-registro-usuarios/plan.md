# 006 · Entrada nativa y registro de usuarios — Plan

## Diagnóstico de entrada

1. Reproducir el foco y escritura en el WebView del emulador.
2. Revisar si un overlay, el control de teclado de Capacitor o el manejo controlado de `IonInput` bloquea el foco.
3. Aplicar la corrección mínima dentro de `AppInput` o `LoginPage`, sin sustituir componentes Ionic por inputs HTML.
4. Validar manualmente con teclado virtual y físico.

## Registro

Tras la aprobación del contrato, agregar:

1. Tipos API y endpoint en `services/api/endpoints/auth.ts`.
2. Schema Zod y formulario con React Hook Form.
3. Página o estado de registro dentro de `features/auth/`.
4. Pruebas unitarias y de integración.

No se guardarán contraseñas, tokens ni datos sensibles fuera del almacenamiento seguro existente.
