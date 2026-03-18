# LogiTrack Pro: Sistema de Gestión de Inventarios y Recepción de Lotes

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-007ACC?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

LogiTrack Pro es una solución web integral diseñada para la gestión eficiente de inventarios, recepción de lotes y control logístico. Desarrollada con tecnologías de vanguardia (Next.js App Router, Tailwind CSS, Prisma y SQLite/Supabase), esta plataforma ofrece una interfaz unificada, segura y adaptable para monitorizar las operaciones diarias de bodegas y centros de distribución.

## ✨ Características Principales

- **Dashboard Analítico**: Resumen en tiempo real del estado de ocupación de estantes, uso de capacidad y entradas/salidas recientes.
- **Control Drive-in (10x7)**: Registro de los ingresos vehiculares por las rampas de control y estado en vivo de cada muelle funcional.
- **Recepción de Lotes**: Formulario ágil para la asignación de lotes entrantes a slots pre-configurados del sistema, sugiriendo ubicaciones mediante algoritmos lógicos (Mockup actual).
- **Control de Salidas a Producción**: Monitorización continua de requerimientos y despliegue del inventario interno hacia líneas de producción o clientes.
- **Seguridad Rigurosa**: Autenticación asimétrica y validación estricta de cookies basada en **JWT** y **Bcryptjs**, complementado con Roles de Acceso (RBAC).
- **Diseño Mobile-First**: Maquetación construida sobre principios _100dvh_ garantizando un despliegue sin fallas tanto en pantallas móviles como de escritorio.

## 🚀 Arquitectura Tecnológica

- **Frontend & Routing**: [Next.js (App Router)](https://nextjs.org/) + React Server Components.
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/).
- **Base de Datos**: [SQLite local](https://www.sqlite.org/) (En transición a [Supabase PostgreSQL](https://supabase.com/)).
- **ORM**: [Prisma](https://www.prisma.io/).
- **Autenticación**: JSON Web Tokens (`jose`) y Hasheo de claves (`bcryptjs`).
- **Iconografía**: [Lucide React](https://lucide.dev/).

## 📋 Requisitos Previos

Asegúrate de tener instalados:

- **Node.js**: `v18.0` o superior.
- **NPM**: `v9.0` o superior (Opcional pnpm / yarn).
- **Git** (Para clonar y gestionar versiones).

## 🛠️ Instalación y Puesta en Marcha (Local)

1. **Clona el Repositorio**

   ```bash
   git clone https://github.com/dev-juantag/proyecto-gestion-inventarios.git
   cd proyecto-gestion-inventarios
   ```

2. **Instala las dependencias principales**

   ```bash
   npm install
   ```

3. **Configura el Entorno Local (.env)**
   El archivo `.env` por defecto requiere tu cadena de conexión a la base de datos (SQLite mientras desarrollas):

   ```ini
   DATABASE_URL="file:dev.db"
   JWT_SECRET="alguna-clave-secreta-súper-segura-en-producción"
   ```

4. **Sincroniza y Genera el Cliente Prisma**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Aplica los Seeds Obligatorios** (Crea al usuario Root Administrador)

   ```bash
   npx prisma db seed
   ```

6. **Inicia el Servidor de Desarrollo**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) desde tu navegador.

## 🔐 Credenciales Base (Seed)

El script de inicialización de la Base de Datos genera los roles de la aplicación y un usuario **Super Admin** raíz mediante el cual podrás ingresar tras instanciar la plataforma en tu entorno local:

- **Usuario**: `juantaguado05@gmail.com`
- **Contraseña**: `admin123`

_(Nota: Evita utilizar estas claves genéricas en despliegues a producción y cámbialas en futuros entornos)._

## 📂 Directorio del Proyecto

La aplicación se estructura principalmente en:

- `/src/app/` - Rutas principales de Next.js (`/login`, `/dashboard`).
- `/src/app/dashboard/_components/` - Fragmentos reusables protegidos (Sidebar y Topbar).
- `/src/app/api/` - Controladores y Endpoints de lógica Backend (`/auth/login`).
- `/src/lib/` - Lógica de sesión, criptografía cruzada de Json Web Tokens (`auth.ts`).
- `/prisma/` - Modelos de la Base de Datos (`schema.prisma`) y poblamientos (`seed.ts`).

## 🤝 Próximos Pasos & Mantenimiento

Este proyecto es iterativo. Durante las fases iniciales se trabajará configurando la **Lógica de Base de Datos Subyacente** conectando las distintas vistas (Mockups visuales actuales) con inserciones y cálculos reales mediante la base de datos local pre-integración final con la infraestructura de _Supabase_.

Cualquier duda en el uso, repasar la documentación local o abrir un issue en el tracking.
