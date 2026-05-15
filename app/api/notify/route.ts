import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { casos, compromisos } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { generateSignToken } from "@/lib/utils";
import { sendEmail, getSignatureRequestEmailHtml } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const casoId = body.caso_id;

    if (!casoId) {
      return NextResponse.json(
        { error: "caso_id requerido" },
        { status: 400 }
      );
    }

    const casoResult = await db
      .select()
      .from(casos)
      .where(eq(casos.id, casoId))
      .limit(1);

    if (casoResult.length === 0) {
      return NextResponse.json(
        { error: "Caso no encontrado" },
        { status: 404 }
      );
    }

    const caso = casoResult[0];

    if (caso.estado !== "recogiendo") {
      return NextResponse.json(
        { error: "El caso no está recogiendo firmas" },
        { status: 400 }
      );
    }

    // Get all active confirmed pledges
    const lista = await db
      .select()
      .from(compromisos)
      .where(and(eq(compromisos.activo, true), eq(compromisos.confirmado, true)));

    let enviados = 0;

    for (const comp of lista) {
      // Skip the case creator
      if (comp.email === caso.solicitanteEmail) continue;

      const signToken = generateSignToken(caso.id, comp.id);

      await sendEmail({
        to: comp.email,
        subject: "Un diabético necesita tu firma — 10 segundos",
        html: getSignatureRequestEmailHtml(
          comp.nombre,
          caso.id,
          caso.medicinaDenegada,
          caso.autoridadNombre,
          caso.autoridadCiudad,
          signToken
        ),
      });

      enviados++;

      // Batch: 50 per minute
      if (enviados % 50 === 0) {
        await new Promise((r) => setTimeout(r, 60000));
      }
    }

    return NextResponse.json({
      mensaje: `Notificaciones enviadas: ${enviados}`,
      enviados,
    });
  } catch (error) {
    console.error("Error en POST /api/notify:", error);
    return NextResponse.json(
      { error: "Error del servidor" },
      { status: 500 }
    );
  }
}
