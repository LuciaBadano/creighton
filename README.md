# 🌸 Ciclo Creighton — App de Registro Personal

App web para registrar tu ciclo usando los códigos oficiales del Método Creighton.
Funciona en computadora y celular. Tus datos se guardan en la nube (Supabase).

---

## ✅ Qué necesitás instalar (solo la primera vez)

1. **Node.js** → https://nodejs.org (descargar versión LTS)
2. **Git** → https://git-scm.com (para subir el código a Vercel)
3. **Una cuenta en GitHub** → https://github.com (gratis)
4. **Una cuenta en Supabase** → https://supabase.com (gratis)
5. **Una cuenta en Vercel** → https://vercel.com (gratis, conectás con GitHub)

---

## 🗄️ PASO 1 — Crear la base de datos en Supabase

1. Entrá a https://supabase.com y creá una cuenta
2. Hacé click en **"New Project"**, elegí un nombre (ej: `creighton`) y una contraseña
3. Esperá que termine de crearse (tarda ~1 min)
4. En el menú izquierdo, hacé click en **SQL Editor**
5. Copiá el contenido del archivo `supabase-schema.sql` y pegalo ahí
6. Hacé click en **Run** (o Ctrl+Enter)

Luego, para obtener tus claves:
- Andá a **Project Settings → API**
- Copiá la **Project URL** (algo como `https://xxxxx.supabase.co`)
- Copiá la **anon/public key** (clave larga que empieza con `eyJ...`)

---

## ⚙️ PASO 2 — Configurar el proyecto en tu computadora

Abrí una terminal (en Windows: buscá "PowerShell" o "CMD") y ejecutá:

```bash
# Entrá a la carpeta del proyecto
cd creighton

# Instalá las dependencias
npm install

# Creá el archivo de variables de entorno
cp .env.example .env
```

Abrí el archivo `.env` con cualquier editor de texto y reemplazá:

```
VITE_SUPABASE_URL=https://TU-URL-AQUI.supabase.co
VITE_SUPABASE_ANON_KEY=eyJTU-CLAVE-AQUI...
```

Para probar en tu computadora:
```bash
npm run dev
```
Abrí http://localhost:5173 en el navegador.

---

## 🚀 PASO 3 — Publicar en Vercel (para acceder desde el celular)

1. Subí el código a GitHub:
   - Creá un repositorio nuevo en https://github.com (llamalo `creighton`)
   - Seguí las instrucciones que te da GitHub para subir una carpeta existente

2. Entrá a https://vercel.com, creá una cuenta y hacé click en **"New Project"**
3. Seleccioná tu repositorio de GitHub `creighton`
4. Antes de hacer deploy, en **Environment Variables** agregá:
   - `VITE_SUPABASE_URL` → tu URL de Supabase
   - `VITE_SUPABASE_ANON_KEY` → tu clave anon de Supabase
5. Hacé click en **Deploy**

¡Listo! Vercel te da una URL tipo `https://creighton-tu-nombre.vercel.app` que podés abrir desde el celular.

---

## 📱 Usar desde el celular

Simplemente abrí la URL de Vercel en el navegador del celular.
Para instalarlo como app:
- **iPhone**: Safari → compartir → "Agregar a pantalla de inicio"
- **Android**: Chrome → menú (⋮) → "Agregar a pantalla de inicio"

---

## 📓 Códigos del Método Creighton incluidos

| Código | Descripción |
|--------|-------------|
| 0      | Seco |
| 2      | Húmedo sin lubricación |
| 2W     | Mojado sin lubricación |
| 4      | Brillo sin lubricación |
| 6      | Pegajoso (0.5 cm) |
| 8      | Ligoso (1-2 cm) |
| 10     | Elástico (2.5+ cm) |
| 10DL   | Húmedo con lubricación |
| 10SL   | Brillo con lubricación |
| 10WL   | Mojado con lubricación |

**Características:** B, C, C/K, G, K, L, P, R, Y

---

## 🛠️ Modificar la app con Claude

Esta app está diseñada para crecer con vos. Podés pedirle a Claude que:
- Agregue nuevas vistas (gráfico de ciclo, historial, exportar PDF)
- Cambie colores o diseño
- Agregue notificaciones o recordatorios
- Cualquier cosa que necesites

Simplemente compartí el código de un archivo y pedí el cambio.
