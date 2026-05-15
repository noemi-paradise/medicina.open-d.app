import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { compromisos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendEmail, getWelcomeEmailHtml } from "@/lib/email";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return new Response(
        `<html><body><h1>Enlace no válido</h1><p>Falta el token.</p></body></html>`,
        { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    const result = await db
      .select()
      .from(compromisos)
      .where(eq(compromisos.token, token))
      .limit(1);

    if (result.length === 0) {
      return new Response(
        `<html><body><h1>Enlace no válido</h1><p>El token no existe.</p></body></html>`,
        { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    const pledge = result[0];

    if (pledge.confirmado) {
      return new Response(
        `<html><body><h1>✅ Ya estabas confirmado</h1><p>Tu compromiso ya estaba activo. Gracias.</p></body></html>`,
        { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    await db
      .update(compromisos)
      .set({
        confirmado: true,
        confirmadoEn: new Date(),
        activo: true,
      })
      .where(eq(compromisos.id, pledge.id));

    await sendEmail({
      to: pledge.email,
      subject: "Bienvenido/a a la lista — medicina.open-d.app",
      html: getWelcomeEmailHtml(pledge.nombre),
    });

    return new Response(
      `<html><body><h1>✅ Confirmado</h1><p>Estás en la lista. Te avisaremos cuando alguien necesite tu firma.</p></body></html>`,
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  } catch (error) {
    console.error("Error en GET /api/pledge/confirm:", error);
    return new Response(
      `<html><body><h1>Error</h1><p>Ha ocurrido un error. Inténtalo de nuevo.</p></body></html>`,
      { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
}
