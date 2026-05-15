import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { casos, firmas, compromisos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateLetter } from "@/lib/pdf/generator";
import { sendEmail, getLetterCopyEmailHtml } from "@/lib/email";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const casoId = parseInt(params.id, 10);
    if (isNaN(casoId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token requerido" }, { status: 403 });
    }

    const casoResult = await db
      .select()
      .from(casos)
      .where(eq(casos.id, casoId))
      .limit(1);

    if (casoResult.length === 0) {
      return NextResponse.json({ error: "Caso no encontrado" }, { status: 404 });
    }

    const caso = casoResult[0];

    if (caso.tokenSeguimiento !== token) {
      return NextResponse.json({ error: "Token inválido" }, { status: 403 });
    }

    // Get signatures
    const firmasResult = await db
      .select()
      .from(firmas)
      .where(eq(firmas.casoId, casoId));

    const nombresFirmas = firmasResult.map((f: { nombreEnCarta: string }) => f.nombreEnCarta);

    const pdfBytes = await generateLetter({
      id: caso.id,
      solicitanteNombre: caso.solicitanteNombre,
      medicinaDenegada: caso.medicinaDenegada,
      autoridadNombre: caso.autoridadNombre,
      autoridadCiudad: caso.autoridadCiudad,
      autoridadRegion: caso.autoridadRegion,
      historia: caso.historia,
      firmas: nombresFirmas,
    });

    // Update case
    await db
      .update(casos)
      .set({
        cartaGeneradaEn: new Date(),
        estado: caso.estado === "recogiendo" ? "listo" : caso.estado,
      })
      .where(eq(casos.id, casoId));

    // Send copy to all signers
    const pdfUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/letter/${casoId}?token=${token}`;
    for (const firma of firmasResult) {
      const comp = await db
        .select()
        .from(compromisos)
        .where(eq(compromisos.id, firma.compromisoId))
        .limit(1);
      if (comp.length > 0) {
        await sendEmail({
          to: comp[0].email,
          subject: `Copia de la carta — caso #${casoId}`,
          html: getLetterCopyEmailHtml(comp[0].nombre, casoId, pdfUrl),
        });
      }
    }

    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="carta-reclamacion-${casoId}.pdf"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error en GET /api/letter:", error);
    return NextResponse.json(
      { error: "Error del servidor" },
      { status: 500 }
    );
  }
}
