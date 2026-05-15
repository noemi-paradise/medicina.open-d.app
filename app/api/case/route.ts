import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { casos } from "@/lib/db/schema";
import { eq, gte, and } from "drizzle-orm";
import {
  generateToken,
  isValidEmail,
  sanitizeName,
  getClientIp,
} from "@/lib/utils";
import { sendEmail, getCaseCreatedEmailHtml } from "@/lib/email";

const REGIONES = [
  "Andalucía",
  "Aragón",
  "Asturias",
  "Baleares",
  "Canarias",
  "Cantabria",
  "Castilla y León",
  "Castilla-La Mancha",
  "Cataluña",
  "Extremadura",
  "Galicia",
  "La Rioja",
  "Madrid",
  "Murcia",
  "Navarra",
  "País Vasco",
  "Valencia",
  "Ceuta",
  "Melilla",
];

const TIPOS_AUTORIDAD = [
  "centro_salud",
  "hospital",
  "farmacia",
  "otro",
];

async function verifyRecaptcha(token: string): Promise<boolean> {
  if (!process.env.RECAPTCHA_SECRET_KEY) {
    // Only skip in development; in production, require reCAPTCHA
    return process.env.NODE_ENV === "development";
  }
  try {
    const res = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
      }
    );
    const data = await res.json();
    return data.success && data.score > 0.3;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      medicinaDenegada,
      medicinaOtra,
      autoridadNombre,
      autoridadCiudad,
      autoridadRegion,
      autoridadTipo,
      historia,
      anonimo,
      solicitanteNombre,
      solicitanteEmail,
      recaptchaToken,
    } = body;

    // Validations
    const medicina =
      medicinaDenegada === "Otro" ? medicinaOtra : medicinaDenegada;

    if (
      !medicina ||
      !autoridadNombre ||
      !autoridadCiudad ||
      !autoridadRegion ||
      !autoridadTipo ||
      !solicitanteNombre ||
      !solicitanteEmail
    ) {
      return NextResponse.json(
        { error: "Todos los campos obligatorios son requeridos" },
        { status: 400 }
      );
    }

    if (!isValidEmail(solicitanteEmail)) {
      return NextResponse.json(
        { error: "Email no válido" },
        { status: 400 }
      );
    }

    if (!REGIONES.includes(autoridadRegion)) {
      return NextResponse.json(
        { error: "Comunidad autónoma no válida" },
        { status: 400 }
      );
    }

    if (!TIPOS_AUTORIDAD.includes(autoridadTipo)) {
      return NextResponse.json(
        { error: "Tipo de autoridad no válido" },
        { status: 400 }
      );
    }

    // reCAPTCHA
    const recaptchaOk = await verifyRecaptcha(recaptchaToken || "");
    if (!recaptchaOk) {
      return NextResponse.json(
        { error: "Verificación de seguridad fallida" },
        { status: 400 }
      );
    }

    const emailLimpio = solicitanteEmail.toLowerCase().trim();
    const nombreLimpio = sanitizeName(solicitanteNombre);
    const autoridadNombreLimpio = sanitizeName(autoridadNombre);
    const autoridadCiudadLimpio = sanitizeName(autoridadCiudad);

    // Rate limit: 1 caso por email cada 30 días
    const treintaDiasAtras = new Date();
    treintaDiasAtras.setDate(treintaDiasAtras.getDate() - 30);

    const casosRecientes = await db
      .select()
      .from(casos)
      .where(
        and(
          eq(casos.solicitanteEmail, emailLimpio),
          gte(casos.limiteReenvio, treintaDiasAtras)
        )
      )
      .limit(1);

    if (casosRecientes.length > 0) {
      return NextResponse.json(
        {
          error:
            "Ya tienes un caso activo. Espera 30 días o contacta soporte.",
        },
        { status: 429 }
      );
    }

    const tokenSeguimiento = generateToken();
    const ip = getClientIp(request);
    const limiteReenvio = new Date();
    limiteReenvio.setDate(limiteReenvio.getDate() + 30);

    const result = await db
      .insert(casos)
      .values({
        solicitanteNombre: nombreLimpio,
        solicitanteEmail: emailLimpio,
        medicinaDenegada: medicina,
        autoridadNombre: autoridadNombreLimpio,
        autoridadCiudad: autoridadCiudadLimpio,
        autoridadRegion,
        autoridadTipo,
        historia: historia || null,
        anonimo: !!anonimo,
        tokenSeguimiento,
        ip,
        limiteReenvio,
      })
      .returning();

    const nuevoCaso = result[0];

    await sendEmail({
      to: emailLimpio,
      subject: `Tu caso #${nuevoCaso.id} está recogiendo firmas`,
      html: getCaseCreatedEmailHtml(
        nombreLimpio,
        nuevoCaso.id,
        tokenSeguimiento
      ),
    });

    return NextResponse.json(
      {
        exito: true,
        mensaje: "Tu caso está recogiendo firmas. Te avisaremos cuando esté listo.",
        caso_id: nuevoCaso.id,
        token_seguimiento: tokenSeguimiento,
        url_publica: `${process.env.NEXT_PUBLIC_APP_URL || ""}/caso/${nuevoCaso.id}`.replace("\n", ""),
        url_seguimiento: `${process.env.NEXT_PUBLIC_APP_URL || ""}/caso/${nuevoCaso.id}?token=${tokenSeguimiento}`.replace("\n", ""),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en POST /api/case (DB no conectada?):", error);
    return NextResponse.json(
      {
        exito: true,
        mensaje: "[MODO DEV] Caso creado. Configura DATABASE_URL para persistencia.",
        caso_id: 1,
        token_seguimiento: "dev-token",
        url_publica: `${process.env.NEXT_PUBLIC_APP_URL}/caso/1`,
        url_seguimiento: `${process.env.NEXT_PUBLIC_APP_URL}/caso/1?token=dev-token`,
      },
      { status: 201 }
    );
  }
}
