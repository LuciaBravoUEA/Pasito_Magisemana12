# Evidencia de modo avión

## Procedimiento

1. Iniciar sesión y abrir `Rutinas` con conexión; esperar a que aparezca “Datos sincronizados”.
2. Activar modo avión en el emulador Android.
3. Volver a `Rutinas` y comprobar que la lista cacheada sigue visible junto con “Puedes estar viendo datos desactualizados” y la fecha de última sincronización.
4. Crear una rutina. La interfaz debe confirmar que quedó pendiente en la cola de salida y no mostrar un error de red como si se hubiera perdido.
5. Desactivar modo avión. Al recuperar conectividad, comprobar que la cola se procesa y la lista se invalida.

## Estado

Pendiente de captura manual en el emulador Android. La lógica está cubierta por la separación remoto/local/outbox y por las pruebas automatizadas de la capa de datos; esta evidencia requiere interacción con el estado real de red del dispositivo.