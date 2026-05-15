# medicina.open-d.app

> **"Nadie sin su medicina"**

Plataforma de código abierto para que pacientes a los que se les niega medicación para diabetes recojan firmas de apoyo y generen cartas formales de reclamación en PDF.

🔗 **URL:** [https://medicina.open-d.app](https://medicina.open-d.app)

---

## ¿Qué hace?

1. Un paciente al que le niegan insulina, tiras reactivas, sensores CGM u otro material crea un caso.
2. Personas comprometidas reciben un email y firman con un clic.
3. A las 50 firmas se genera automáticamente una carta formal en PDF.
4. El paciente entrega la carta al centro de salud, hospital o autoridad correspondiente.

---

## Stack

- [Next.js 14](https://nextjs.org/) (App Router)
- [Neon PostgreSQL](https://neon.tech/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Resend](https://resend.com/) (emails transaccionales)
- [pdf-lib](https://pdf-lib.js.org/) (generación de PDFs)
- [Tailwind CSS](https://tailwindcss.com/)

---

## Instalación local

```bash
# 1. Clonar
git clone https://github.com/open-d-app/medicina.open-d.app.git
cd medicina.open-d.app

# 2. Instalar dependencias
npm install

# 3. Variables de entorno
cp .env.local.example .env.local
# Edita .env.local con tus credenciales

# 4. Base de datos
npm run db:push

# 5. Arrancar
npm run dev
```

---

## Variables de entorno

| Variable | Descripción | Obligatoria |
|----------|-------------|-------------|
| `DATABASE_URL` | URL de conexión PostgreSQL (Neon) | ✅ |
| `RESEND_API_KEY` | API key de Resend para emails | ✅ |
| `NEXT_PUBLIC_APP_URL` | URL pública de la app | ✅ |
| `CRON_SECRET` | Secreto para proteger `/api/notify` | ✅ |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Site key reCAPTCHA v3 | Opcional |
| `RECAPTCHA_SECRET_KEY` | Secret key reCAPTCHA v3 | Opcional |

---

## Comandos útiles

```bash
npm run dev          # Desarrollo
npm run build        # Build de producción
npm run db:generate  # Generar migraciones Drizzle
npm run db:push      # Aplicar schema a la base de datos
```

---

## Estructura del proyecto

```
app/
  page.tsx                    # Landing (stats + pledge)
  layout.tsx                  # Root layout
  globals.css                 # Tailwind + colores
  unirse/page.tsx             # Formulario de compromiso
  caso/nuevo/page.tsx         # Crear caso
  caso/[id]/page.tsx          # Página pública del caso
  carta/[id]/page.tsx         # Descargar PDF
  instrucciones/page.tsx      # Guía de uso
  faq/page.tsx                # Preguntas frecuentes
  privacidad/page.tsx         # Política GDPR
  api/
    pledge/route.ts           # Crear compromiso
    pledge/confirm/route.ts   # Confirmar email
    case/route.ts             # Crear caso
    case/[id]/route.ts        # Datos públicos del caso
    sign/route.ts             # Firmar
    letter/[id]/route.ts      # Generar PDF
    notify/route.ts           # Enviar peticiones (protegido)
    stats/route.ts            # Estadísticas públicas
lib/
  db/schema.ts                # Esquema Drizzle (4 tablas)
  db/index.ts                 # Cliente Neon
  email/index.ts              # 11 templates de email
  pdf/generator.ts            # Generador de PDFs
  utils.ts                    # Helpers (tokens, hashes)
```

---

## Principios

- **El paciente tiene el poder.** Nosotros recogemos firmas y generamos el PDF. El paciente lo entrega.
- **Sin emails de autoridades.** No necesitamos base de datos de hospitales.
- **Cero fricción.** Unirse = 10 segundos. Firmar = 1 clic.
- **Transparencia total.** Quien firma ve exactamente qué carta está firmando.
- **Derecho, no política.** Citamos la Constitución y los derechos humanos.

---

## Seguridad

- Tokens criptográficos generados con `crypto.randomBytes`.
- Rate limit: 1 caso por email cada 30 días.
- UNIQUE constraint en firmas para evitar duplicados.
- reCAPTCHA v3 invisible en creación de casos.
- IPs logueadas para detección de abuso.
- 3+ reportes = pausa automática del caso.

**Reporta vulnerabilidades:** Abre un issue privado o contacta a través de open-d.app.

---

## Privacidad (GDPR)

- Solo almacenamos: nombre, email, hash del email, IP básica y fechas.
- **No** almacenamos: tipo de diabetes, historial médico, DNI, dirección postal.
- Checkbox explícito de consentimiento.
- Derecho al olvido (unsubscribe en cada email).
- Casos cerrados: mantener 2 años, luego anonimizar.

---

## Licencia

[MIT](LICENSE) — Código abierto, uso libre.

---

## Comunidad

- 🌐 [open-d.app](https://open-d.app)
- 💬 Issues y PRs bienvenidos

**Nadie sin su medicina.** 💙
