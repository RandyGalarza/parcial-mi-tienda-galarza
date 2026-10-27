# Mi Tienda

Aplicación móvil de inventario para una tienda de barrio. SQLite es la fuente de
verdad y permite consultar y modificar productos sin conexión; Supabase Auth
gestiona las cuentas y Supabase almacena la copia sincronizada.

**Estudiante:** [Randy Galarza]<br>

## Requisitos

- Node.js y npm.
- Un proyecto propio de Supabase.
- Expo Go o un development build compatible con Expo SDK 58.

## Configuración

1. Instala las dependencias:

   ```sh
   npm install
   ```

2. Copia `.env.example` a `.env` y completa la URL y la **publishable key** de tu
   proyecto. La app cliente solo usa esa clave pública. Nunca pongas una
   secret/service-role key en la app ni en ningún archivo que subas a GitHub;
   `.env` es local y no se debe versionar.

   ```dotenv
   EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```

3. En Supabase, abre **SQL Editor** y ejecuta el contenido de
   [`db/supabase.sql`](db/supabase.sql). Luego, en **Authentication → Providers
   → Email**, desactiva la confirmación por correo para que el registro inicie
   sesión inmediatamente.
4. Inicia la aplicación:

   ```sh
   npx expo start
   ```

   Si usas SQLite desde el navegador, abre el servidor web en `localhost` y
   reinicia Metro después de cambiar su configuración. La app necesita los
   encabezados de aislamiento de origen que configura `metro.config.js`; el
   plugin de Expo Router también los aplica al alojamiento web compatible.

5. Si cambiaste `db/schema.ts`, genera una migración y reinicia Metro:

   ```sh
   npx drizzle-kit generate
   ```

   Las migraciones guardadas en `drizzle/` se aplican al iniciar la app.

## Funcionalidades

- Registro e inicio de sesión con correo y contraseña. La sesión se conserva en
  SecureStore en iOS/Android y en el almacenamiento del navegador en web; las
  rutas se protegen con `Stack.Protected`.
- Alta, edición y eliminación local de productos, incluso sin internet. Antes de
  eliminar, la app pide confirmación.
- Lista reactiva con unidades, valor total, estado de sincronización y cantidad
  de productos pendientes.
- Sincronización manual: primero descarga productos remotos que aún no existen
  en el teléfono y después sube los cambios locales pendientes por `client_id`.
- Seguridad de fila en Supabase: cada usuario solo accede a sus propios productos.

Los borrados son locales y no se propagan a la nube; la consigna deja el borrado
sincronizado fuera del alcance.

## Capturas

Capturas de la aplicación y de la tabla de productos en Supabase:

### 1. Inicio de sesión

![Inicio de sesión](capturas/1.%20login.png)

### 2. Registro

![Registro](capturas/2.%20registro.png)

### 3. Inventario principal

![Inventario principal](capturas/3.%20inicio.png)

### 4. Edición de producto

![Edición de producto](capturas/4.%20editar.png)

### 5. Producto pendiente de sincronización

![Producto sin sincronizar](capturas/5.%20sin%20subir.png)

### 6. Inventario sincronizado

![Inventario sincronizado](capturas/6.%20todo%20sincronizado.png)

### 7. Productos en Supabase

![Tabla products en Supabase](capturas/7.%20supa.png)
