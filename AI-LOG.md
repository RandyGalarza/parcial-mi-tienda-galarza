# 🤖 Registro de Auditoría de IA (AI-LOG)

**Estudiante:** Randy Galarza<br>
**Semana 9:** Parcial<br>
**Proyecto:** Mi Tienda — inventario local y en la nube

## 1. Prompts utilizados

- «Revisa la estructura de este proyecto Expo con TypeScript y SDK 58. Usa los
  requisitos del parcial para convertir la pantalla inicial en una app de
  inventario móvil y conserva las convenciones que ya tenga el repositorio».
- «Implementa inicio de sesión y registro con Supabase Auth, validación de
  contraseñas y mensajes de error visibles. Conserva la sesión con SecureStore
  y protege las rutas con Stack.Protected».
- «Define la tabla local products con Drizzle y SQLite, genera su migración y
  crea un repositorio y hooks reactivos para listar, crear, editar y eliminar
  productos sin conexión. Genera clientId con Expo Crypto fuera del esquema».
- «Crea la pantalla de inventario con total de unidades, valor total,
  productos pendientes, indicador de sincronización, confirmación antes de
  borrar y acceso al formulario de alta y edición».
- «Implementa la sincronización manual con Supabase: primero descarga los
  productos remotos que falten en SQLite y después sube los productos
  pendientes con upsert por client_id. Muestra los errores y el resultado».
- «Prepara el SQL de products con restricciones y políticas RLS por usuario.
  Configura la app para usar solo la publishable key y asegúrate de que .env
  quede fuera del repositorio».
- «Ejecuta typecheck, lint, expo-doctor y exportación para Android; corrige
  los errores que aparezcan y vuelve a validar los cambios».
- «Investiga por qué falla el bundle web de expo-sqlite al resolver
  wa-sqlite.wasm. Ajusta Metro y los encabezados necesarios para SQLite web,
  sin cambiar el comportamiento nativo».
- «Corrige el almacenamiento de sesión en navegador: SecureStore debe seguir
  usándose en iOS y Android, y la alternativa web no debe depender de una API
  nativa que no existe».
- «Revisa la jerarquía de AuthProvider y las rutas protegidas en Expo Router.
  Asegura que las pantallas usen el contexto de autenticación tanto en web
  como en móvil».
- «Rediseña visualmente la app completa con prioridad móvil: crea un lenguaje
  visual consistente, mejora los formularios, el resumen del inventario, las
  métricas, las tarjetas de productos y los estados vacíos, sin modificar la
  lógica de autenticación, SQLite ni sincronización».
- «Comprueba el rediseño en un viewport móvil y escritorio, ejecuta lint,
  TypeScript y exportación web, y corrige problemas de formato o compilación».

## 2. Código generado vs. código modificado

- **¿Qué generó la IA?:** Pantallas de autenticación e inventario, contexto de
  sesión con SecureStore, esquema y migración de SQLite/Drizzle, repositorio y
  hooks de productos, integración tipada con Supabase, sincronización manual,
  SQL con políticas RLS, documentación del proyecto y una actualización
  integral de la presentación visual de login, registro, inventario y formulario
  de producto.
- **¿Qué modifiqué/corregí?:** El código se adaptó al proyecto existente y a
  Expo SDK 58. Se revisó la separación entre pantallas, hooks y repositorio; se
  hizo que el formulario cargue los datos iniciales del producto sin actualizar
  estado directamente desde un efecto; y se pasó la base de datos a la función
  de sincronización en vez de llamar un hook fuera de un componente. También se
  reforzó `.gitignore`, se dejó `.env` fuera del índice de Git y se cambió la
  variable de ejemplo a `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Para el bundle
  web se ajustaron los recursos WASM y encabezados requeridos por SQLite; el
  almacenamiento web se separó de SecureStore nativo y se corrigió el alcance
  del proveedor de autenticación. En el rediseño se centralizaron componentes
  visuales compartidos y se conservaron los flujos existentes.

## 3. Alucinaciones o errores detectados

- El primer lint señaló una actualización de estado dentro de un efecto en el
  formulario; se corrigió y el lint posterior pasó.
- La revisión del flujo encontró que la sincronización no debía invocar un hook
  de React dentro de una función de servicio; se corrigió pasando el repositorio
  de base de datos como parámetro.
- En web se detectaron diferencias de plataforma: SecureStore no está
  disponible como almacenamiento web, SQLite WASM requiere configuración de
  recursos y aislamiento mediante encabezados, y las rutas asíncronas podían
  separar módulos del contexto de autenticación. Se aplicaron ajustes
  específicos para web sin sustituir SecureStore en iOS/Android.
- No se identificaron APIs de Expo inventadas: se contrastaron Expo Router,
  SQLite, SecureStore y Crypto con la documentación de SDK 58. La versión final
  del rediseño pasó `npx expo lint`, `npx tsc --noEmit` y
  `npx expo export --platform web`; también se comprobó la pantalla de acceso y
  el registro en navegador.
- No se probaron la autenticación ni la sincronización contra el proyecto real
  del estudiante; requieren configurar las credenciales propias y ejecutar el
  SQL en Supabase.
