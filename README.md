# Batallón 11 — General José María Paz

Sitio web del **Batallón 11 General José María Paz**, grupo de los **Exploradores Argentinos de Don Bosco** (Salesianos).

---

## ¿Qué es este proyecto?

Es la **página oficial del batallón**: un lugar en internet donde la comunidad exploradoril puede **conocer la propuesta**, **ver novedades**, **enterarse de eventos** y **acercarse a cada etapa** del camino formativo.

Está pensado para tres grupos de personas:

| Quién lo usa | Para qué sirve |
| --- | --- |
| **Familias y visitantes** | Ver información del batallón, ubicación, contacto, fotos y noticias sin necesidad de registrarse. |
| **Exploradores y jóvenes** | Entrar a la página de su etapa (Pioneros y Fuegos, Rastreadores, etc.) y ver publicaciones y galerías propias de ese grupo. |
| **Coordinadores y animadores** | Entrar al **panel de administración** para subir fotos, escribir publicaciones, cargar eventos y mantener el sitio al día. |

En resumen: **reemplaza o complementa la cartelera física del grupo** con un espacio digital ordenado, accesible desde el celular o la computadora.

---

## ¿Qué se puede hacer en el sitio?

### Parte pública (cualquier persona)

- **Inicio**: presentación del batallón, quiénes somos y acceso a las etapas.
- **Etapas**: cada grupo tiene su propia página con emblema, descripción, publicaciones y galería de fotos.
- **Publicaciones**: novedades generales del batallón (actividades, avisos, momentos compartidos).
- **Eventos**: próximas actividades con fecha y lugar.
- **Ubicación y contacto**: cómo llegar y cómo comunicarse con el grupo.

### Panel de administración (solo usuarios autorizados)

- Publicar y editar **noticias** del sitio general o de una etapa concreta.
- Subir y ordenar **fotos** en las galerías.
- Gestionar **eventos** del calendario.
- Acceso con usuario y contraseña; algunos roles solo pueden editar su propia etapa.

Las imágenes pueden guardarse en el servidor o en **Supabase Storage** (nube), según cómo esté configurado el entorno.

---

## Etapas del batallón

Cada etapa tiene su página en `/etapas/nombre-de-la-etapa`:

| Etapa | Enlace |
| --- | --- |
| Horneros y Pichones | `/etapas/horneros-pichones` |
| Caminantes y Chispistas | `/etapas/caminantes-chispistas` |
| Pioneros y Fuegos | `/etapas/pioneros-fuegos` |
| Rastreadores | `/etapas/rastreadores` |
| Baqueanos | `/etapas/baqueanos` |
| Soles | `/etapas/soles` |

En la página de cada etapa se muestran hasta cuatro publicaciones y una galería; si hay más contenido, aparece un botón para ver todo en una página dedicada.

---

## ¿Cómo está hecho por dentro? (resumen breve)

El proyecto se divide en dos partes que trabajan juntas:

- **`client/`** — Lo que ve la gente en el navegador (diseño, menús, páginas).
- **`server/`** — El motor que guarda y entrega datos (publicaciones, fotos, usuarios, eventos).

Los datos viven en una base **PostgreSQL** (por ejemplo en Supabase). El repositorio usa **pnpm** para instalar dependencias de ambas partes a la vez.

---

## Puesta en marcha (para quien desarrolla o mantiene el sitio)

### Requisitos

- **Node.js 22** o superior
- **pnpm** 9 o superior (`corepack enable` suele bastar)
- Base de datos **PostgreSQL** (Supabase recomendado)

### Pasos básicos

```bash
# 1. Instalar dependencias
pnpm install

# 2. Configurar variables de entorno
#    Crear server/.env y client/.env con las claves necesarias
#    (base de datos, JWT, correo del admin, URLs de mapas, etc.)

# 3. Preparar la base de datos
pnpm prisma:migrate
pnpm prisma:generate
pnpm prisma:seed

# 4. Arrancar en modo desarrollo
pnpm dev
```

- Sitio web: http://localhost:5173  
- API del servidor: http://localhost:4000  

Para probar desde el **celular en la misma red Wi‑Fi**, abrí en el teléfono `http://<IP-de-tu-PC>:5173` (la IP la muestra Vite al iniciar).

### Base de datos con Supabase

1. En Supabase → **Project Settings → Database**.
2. Copiá la URL del **Transaction pooler** (puerto `6543`) para `DATABASE_URL`.
3. Copiá la URL **Direct** (puerto `5432`) para `DIRECT_URL`.
4. Agregá `?pgbouncer=true&sslmode=require` en la URL del pooler si no viene incluido.

---

## Scripts útiles

| Comando | Qué hace |
| --- | --- |
| `pnpm dev` | Levanta frontend y backend a la vez |
| `pnpm dev:client` | Solo el sitio web |
| `pnpm dev:server` | Solo la API |
| `pnpm build` | Genera la versión de producción del frontend |
| `pnpm start` | Inicia el servidor en producción |
| `pnpm prisma:studio` | Abre un visor visual de la base de datos |

---

## Despliegue

En producción suele usarse:

- **Frontend** → Vercel, Netlify u otro hosting estático.
- **Backend** → Railway, Render u otro servicio Node.
- **Base de datos** → Supabase, Neon o Railway.

Variables importantes en producción: `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL` en el servidor y `VITE_API_URL` en el cliente apuntando a la API publicada.

---

## Licencia

MIT — ver [LICENSE](./LICENSE).
