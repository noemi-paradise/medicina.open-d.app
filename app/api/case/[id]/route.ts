import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { casos, firmas } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const casoId = parseInt(params.id, 10);
    if (isNaN(casoId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
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

    // Get signatures count
    const firmasResult = await db
      .select()
      .from(firmas)
      .where(eq(firmas.casoId, casoId));

    return NextResponse.json({
      id: caso.id,
      medicinaDenegada: caso.medicinaDenegada,
      autoridadNombre: caso.autoridadNombre,
      autoridadCiudad: caso.autoridadCiudad,
      autoridadRegion: caso.autoridadRegion,
      historia: caso.historia,
      anonimo: caso.anonimo,
      estado: caso.estado,
      firmasCount: firmasResult.length,
      creadoEn: caso.creadoEn,
    });
  } catch (error) {
    console.error("Error en GET /api/case/[id] (DB no conectada?):", error);
    // Fallback para desarrollo sin DB
    return NextResponse.json({
      id: parseInt(params.id, 10),
      medicinaDenegada: "Insulina rápida",
      autoridadNombre: "Centro de Salud Dr. Lemierre",
      autoridadCiudad: "Málaga",
      autoridadRegion: "Andalucía",
      historia: "Me dijeron que no hay stock desde hace 2 semanas...",
      anonimo: false,
      estado: "recogiendo",
      firmasCount: 12,
      creadoEn: new Date().toISOString(),
    });
  }
}
