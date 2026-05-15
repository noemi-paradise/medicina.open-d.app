import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { casos, compromisos, firmas } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { generateSignToken, getClientIp } from "@/lib/utils";
import {
  sendEmail,
  getSignatureConfirmedEmailHtml,
  getMilestoneEmailHtml,
  getLetterReadyEmailHtml,
} from "@/lib/email";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const signToken = searchParams.get("token");
    const omit = searchParams.get("omit");

    if (!signToken) {
      return NextResponse.json({ error: "Token requerido" }, { status: 400 });
    }

    // Find all active pledges to verify token
    const allCompromisos = await db
      .select()
      .from(compromisos)
      .where(eq(compromisos.activo, true));

    let matchedCompromisoId: number | null = null;
    let matchedCasoId: number | null = null;

    for (const comp of allCompromisos) {
      // We need to find which caso this token is for
      const allCasos = await db.select().from(casos);
      for (const c of allCasos) {
        const expected = generateSignToken(c.id, comp.id);
        if (expected === signToken) {
          matchedCompromisoId = comp.id;
          matchedCasoId = c.id;
          break;
        }
      }
      if (matchedCasoId) break;
    }

    if (!matchedCasoId || !matchedCompromisoId) {
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 400 }
      );
    }

    // Verify the case exists and is collecting
    const casoResult = await db
      .select()
      .from(casos)
      .where(eq(casos.id, matchedCasoId))
      .limit(1);

    if (casoResult.length === 0) {
      return NextResponse.json({ error: "Caso no encontrado" }, { status: 404 });
    }

    const caso = casoResult[0];

    if (caso.estado !== "recogiendo") {
      return NextResponse.json(
        { error: "Este caso ya no recoge firmas" },
        { status: 400 }
      );
    }

    // Verify pledge is confirmed
    const compResult = await db
      .select()
      .from(compromisos)
      .where(eq(compromisos.id, matchedCompromisoId))
      .limit(1);

    if (compResult.length === 0 || !compResult[0].confirmado) {
      return NextResponse.json(
        { error: "Compromiso no válido" },
        { status: 400 }
      );
    }

    const compromiso = compResult[0];

    if (omit === "true") {
      // User wants to skip this case - we just acknowledge it
      return NextResponse.json(
        { mensaje: "Has omitido este caso. No recibirás más recordatorios." },
        { status: 200 }
      );
    }

    // Check if already signed
    const existingFirma = await db
      .select()
      .from(firmas)
      .where(
        and(
          eq(firmas.casoId, matchedCasoId),
          eq(firmas.compromisoId, matchedCompromisoId)
        )
      )
      .limit(1);

    if (existingFirma.length > 0) {
      return NextResponse.json(
        { mensaje: "Ya has firmado este caso." },
        { status: 200 }
      );
    }

    // Cannot sign own case
    if (caso.solicitanteEmail === compromiso.email) {
      return NextResponse.json(
        { error: "No puedes firmar tu propio caso" },
        { status: 400 }
      );
    }

    const ip = getClientIp(request);

    // Insert signature
    await db.insert(firmas).values({
      casoId: matchedCasoId,
      compromisoId: matchedCompromisoId,
      nombreEnCarta: compromiso.nombre,
      ip,
      token: signToken,
    });

    // Update count
    const newCount = caso.firmasCount + 1;
    await db
      .update(casos)
      .set({ firmasCount: newCount })
      .where(eq(casos.id, matchedCasoId));

    // Send confirmation to signer
    await sendEmail({
      to: compromiso.email,
      subject: "Has firmado — gracias",
      html: getSignatureConfirmedEmailHtml(
        compromiso.nombre,
        caso.id,
        caso.medicinaDenegada,
        caso.autoridadNombre,
        caso.autoridadCiudad
      ),
    });

    // Milestone emails to patient
    if (newCount === 25) {
      await sendEmail({
        to: caso.solicitanteEmail,
        subject: "¡Ya tienes 25 firmas!",
        html: getMilestoneEmailHtml(
          caso.solicitanteNombre,
          caso.id,
          25,
          caso.tokenSeguimiento
        ),
      });
    }

    if (newCount >= 50) {
      await db
        .update(casos)
        .set({ estado: "listo" })
        .where(eq(casos.id, matchedCasoId));

      await sendEmail({
        to: caso.solicitanteEmail,
        subject: "Tu carta está lista — 50 firmas",
        html: getLetterReadyEmailHtml(
          caso.solicitanteNombre,
          caso.id,
          caso.tokenSeguimiento
        ),
      });
    } else if (newCount === 100) {
      await sendEmail({
        to: caso.solicitanteEmail,
        subject: "¡100 firmas! Genera tu carta.",
        html: getMilestoneEmailHtml(
          caso.solicitanteNombre,
          caso.id,
          100,
          caso.tokenSeguimiento
        ),
      });
    }

    return NextResponse.json(
      { mensaje: "Firma registrada. Gracias por tu apoyo." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en GET /api/sign:", error);
    return NextResponse.json(
      { error: "Error del servidor" },
      { status: 500 }
    );
  }
}
