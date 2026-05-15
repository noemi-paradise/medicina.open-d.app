import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { compromisos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  generateToken,
  hashEmail,
  isValidEmail,
  sanitizeName,
  getClientIp,
} from "@/lib/utils";
import { sendEmail, getConfirmEmailHtml } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, email, acepto } = body;

    if (!nombre || !email || !acepto) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    const nombreLimpio = sanitizeName(nombre);
    const emailLimpio = email.toLowerCase().trim();

    if (!isValidEmail(emailLimpio)) {
      return NextResponse.json(
        { error: "Email no válido" },
        { status: 400 }
      );
    }

    if (nombreLimpio.length < 2) {
      return NextResponse.json(
        { error: "Nombre demasiado corto" },
        { status: 400 }
      );
    }

    const emailHash = hashEmail(emailLimpio);

    // Rate limit: 1 pledge por email cada 24h
    const veinticuatroHorasAtras = new Date();
    veinticuatroHorasAtras.setHours(veinticuatroHorasAtras.getHours() - 24);

    const reciente = await db
      .select()
      .from(compromisos)
      .where(
        eq(compromisos.emailHash, emailHash)
      )
      .limit(1);

    if (reciente.length > 0 && reciente[0].comprometidoEn > veinticuatroHorasAtras) {
      return NextResponse.json(
        { mensaje: "Ya estás en la lista. Gracias." },
        { status: 200 }
      );
    }

    // Check if already exists
    const existentes = await db
      .select()
      .from(compromisos)
      .where(eq(compromisos.emailHash, emailHash))
      .limit(1);

    if (existentes.length > 0) {
      const existente = existentes[0];
      if (existente.activo) {
        return NextResponse.json(
          { mensaje: "Ya estás en la lista. Gracias." },
          { status: 200 }
        );
      } else {
        // Reactivate and send new confirmation
        const token = generateToken();
        await db
          .update(compromisos)
          .set({
            activo: true,
            confirmado: false,
            token,
            comprometidoEn: new Date(),
          })
          .where(eq(compromisos.id, existente.id));

        await sendEmail({
          to: emailLimpio,
          subject: "Confirma tu compromiso — medicina.open-d.app",
          html: getConfirmEmailHtml(nombreLimpio, token),
        });

        return NextResponse.json(
          { mensaje: "Te hemos reenviado el email de confirmación." },
          { status: 200 }
        );
      }
    }

    const token = generateToken();
    const ip = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "";

    await db.insert(compromisos).values({
      nombre: nombreLimpio,
      email: emailLimpio,
      emailHash,
      token,
      ip,
      userAgent,
    });

    await sendEmail({
      to: emailLimpio,
      subject: "Confirma tu compromiso — medicina.open-d.app",
      html: getConfirmEmailHtml(nombreLimpio, token),
    });

    return NextResponse.json(
      { mensaje: "Revisa tu email para confirmar tu compromiso." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en POST /api/pledge (DB no conectada?):", error);
    return NextResponse.json(
      { mensaje: "[MODO DEV] Compromiso recibido. Configura DATABASE_URL para persistencia." },
      { status: 201 }
    );
  }
}
