# techHub — Electrónica para Makers

Marketplace de electrónica y componentes para la comunidad maker de Tijuana. Incluye catálogo de productos, carrito de compras, panel de vendedores, asistente IA con recomendaciones y soporte PWA para instalación en dispositivos móviles.

---

## Características principales

**Para compradores**
- Catálogo de productos con filtros por categoría y vendedor
- Precios al menudeo y mayoreo (precio especial al superar cantidad mínima)
- Carrito de compras y lista de deseos
- Reseñas y calificaciones de productos
- Checkout con resumen de orden y confirmación
- Vista de "Reels" — navegación vertical de productos destacados

**Asistente IA**
- Chat integrado en el home y página `/asistente`
- Búsqueda semántica con Groq API
- Respuestas contextuales con tarjetas de producto en tiempo real
- Registro de consultas para analytics

**Para vendedores**
- Panel de vendedor con gestión de productos
- Perfil de tienda con calificación y badge de verificado

**Plataforma**
- PWA instalable (manifest + service worker)
- Soporte de dark/light mode
- Diseño responsivo, optimizado para móvil
- Desplegable en Raspberry Pi con salida standalone

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4.2, shadcn/ui, Radix UI |
| Base de datos | Supabase PostgreSQL + RLS |
| Autenticación | localStorage personalizado (sin Supabase Auth) |
| IA | Groq API |
| Imágenes | Unsplash + Supabase Storage |
| Formularios | React Hook Form + Zod |
| Despliegue | Standalone (Next.js), compatible con Docker y Raspberry Pi |

---

## Requisitos previos

- **Node.js** 18 o superior
- **npm** o **pnpm**
- Cuenta en [Supabase](https://supabase.com) con proyecto configurado
- Clave de API en [Groq](https://console.groq.com)

---

## Instalación y desarrollo

```bash
# Clona el repositorio
git clone https://github.com/tu-usuario/techhub.git
cd techhub

# Instala dependencias
npm install

# Crea el archivo de variables de entorno
cp .env.example .env.local
# (edita .env.local con tus claves, ver sección de Variables de entorno)

# Inicia el servidor de desarrollo en http://localhost:2006
npm run dev
```

---

## Variables de entorno

Crea un archivo `.env.local` en la raíz con las siguientes variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
GROQ_API_KEY=gsk_...
```

> La `SUPABASE_SERVICE_ROLE_KEY` es opcional; solo se necesita para operaciones admin del lado del servidor.

---

## Scripts disponibles

```bash
npm run dev        # Servidor de desarrollo (puerto 2006)
npm run build      # Build de producción (.next/standalone)
npm run start      # Ejecuta el build de producción
npm run lint       # ESLint
npm run rag:eval   # Evalúa la calidad del sistema de búsqueda/recomendaciones IA
```

---

## Estructura del proyecto

```
techhub/
├── app/                          # Rutas de Next.js (App Router)
│   ├── page.tsx                  # Home — hero, productos destacados, categorías
│   ├── layout.tsx                # Layout raíz + SessionProvider
│   ├── globals.css
│   ├── iniciar-sesion/           # Login
│   ├── registro/                 # Registro de usuario
│   ├── productos/                # Listado y búsqueda de productos
│   │   └── [id]/                 # Detalle de producto
│   ├── carrito/                  # Carrito de compras (requiere auth)
│   ├── checkout/                 # Proceso de pago
│   ├── confirmacion-orden/[id]/  # Confirmación de orden
│   ├── perfil/                   # Perfil de usuario (requiere auth)
│   ├── asistente/                # Página completa del chat IA
│   ├── reels/                    # Vista de productos estilo reels
│   ├── vendedor/                 # Panel de vendedor
│   ├── admin/                    # Panel de administración
│   ├── lista/[token]/            # Lista compartida de productos
│   └── api/
│       └── chat/route.ts         # Endpoint del asistente IA (POST)
│
├── components/
│   ├── SessionProvider.tsx       # Contexto global de sesión
│   ├── layout/
│   │   ├── header.tsx
│   │   └── footer.tsx
│   ├── home/                     # Secciones del homepage
│   ├── asistente/                # Tarjetas de recomendación del chat
│   └── ui/                       # Componentes base (shadcn/ui)
│
├── lib/
│   ├── supabase.ts               # Cliente Supabase
│   ├── supabase-queries.ts       # Todas las consultas a la base de datos
│   └── utils.ts                  # Helpers (formateo, validación)
│
├── hooks/
│   ├── useAuth.ts
│   └── useSession.ts             # Acceso al contexto de sesión
│
├── public/
│   ├── manifest.json             # PWA manifest
│   └── sw.js                     # Service worker
│
├── scripts/
│   └── rag-eval.mjs              # Evaluación del sistema RAG
│
└── supabase-schema.sql           # Schema completo de la base de datos
```

---

## Base de datos

El schema principal incluye las siguientes tablas (ver `supabase-schema.sql` para el SQL completo):

| Tabla | Descripción |
|---|---|
| `users` | Usuarios registrados (email, nombre, tipo) |
| `sellers` | Perfil de vendedor vinculado a un usuario |
| `categories` | Categorías de productos |
| `products` | Productos con precio menudeo/mayoreo, stock e imágenes |
| `cart_items` | Carrito de compras por usuario |
| `orders` | Órdenes generadas en checkout |
| `product_favorites` | Lista de deseos del usuario |
| `product_reviews` | Reseñas y calificaciones |
| `assistant_queries` | Log de consultas al asistente IA |

Todas las tablas tienen **Row Level Security (RLS)** habilitado. Los usuarios solo pueden leer y modificar sus propios datos.

---

## Autenticación

Este proyecto **no usa Supabase Auth**. Implementa sesiones con `localStorage`:

1. El usuario ingresa sus credenciales → se consulta la tabla `users` directamente
2. El objeto de usuario se guarda en `localStorage` bajo la clave `techhub_user`
3. `SessionProvider` escucha cambios en storage y el evento personalizado `session-update` para sincronizar entre pestañas
4. Al cerrar sesión, se limpia localStorage y se dispara el evento

---

## Asistente IA

El endpoint `POST /api/chat` recibe `{ message: string }` y:

1. Extrae las primeras 2 palabras clave del mensaje
2. Busca productos en la base de datos con `ILIKE` sobre el campo `name`
3. Envía los resultados + el mensaje a Groq para generar una respuesta contextual
4. Devuelve `{ intent, response, products[] }`

El componente de chat muestra **solo tarjetas de producto** cuando hay resultados, y **solo texto** cuando no hay coincidencias.

---

## PWA

La aplicación es instalable como Progressive Web App:

- **Manifest:** `/public/manifest.json` — nombre, íconos, shortcuts a Productos, Asistente y Carrito
- **Service Worker:** `/public/sw.js`
- **Registro:** `components/pwa-register.tsx`
- Tema: verde (`#64ae63`), idioma `es-MX`

---

## Despliegue

### Producción local / Raspberry Pi

```bash
npm run build
npm start
# El servidor corre en el puerto 3000 por defecto
```

El output `standalone` incluye todo lo necesario para correr sin `node_modules` completos. Compatible con Docker y túneles ngrok.

### Variables de entorno en producción

Asegúrate de definir `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` y `GROQ_API_KEY` en el entorno de producción antes de hacer build.

---

## Contexto del proyecto

- **Equipo:** Vakyro (desarrollador principal) + colaboradores
- **Idioma de UI:** Español (es-MX)
- **Comunidad objetivo:** Makers y entusiastas de electrónica en Tijuana, Baja California
- **Infraestructura:** Raspberry Pi + ngrok para exposición pública

---

## Limitaciones conocidas

- Sin verificación de email al registrarse
- Sin recuperación de contraseña (requiere integración con servicio de correo)
- Imágenes sin optimización de Next.js (`unoptimized: true`) para compatibilidad con URLs externas
- Errores de TypeScript ignorados en build (`ignoreBuildErrors: true`) — pendiente de limpiar antes de producción final

---

## Recursos

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Groq Console](https://console.groq.com)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
