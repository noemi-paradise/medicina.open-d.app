import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { compromisos, casos, firmas } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const totalCompromisos = await db
      .select({ count: sql<number>`count(*)` })
      .from(compromisos);

    const activosCompromisos = await db
      .select({ count: sql<number>`count(*)` })
      .from(compromisos)
      .where(eq(compromisos.activo, true));

    const totalCasos = await db
      .select({ count: sql<number>`count(*)` })
      .from(casos);

    const casosResueltos = await db
      .select({ count: sql<number>`count(*)` })
      .from(casos)
      .where(eq(casos.estado, "resuelto"));

    const cartasGeneradas = await db
      .select({ count: sql<number>`count(*)` })
      .from(casos)
      .where(sql`${casos.cartaGeneradaEn} IS NOT NULL`);

    const totalFirmas = await db
      .select({ count: sql<number>`count(*)` })
      .from(firmas);

    return NextResponse.json({
      compromisos_total: Number(totalCompromisos[0].count),
      compromisos_activos: Number(activosCompromisos[0].count),
      casos_totales: Number(totalCasos[0].count),
      casos_resueltos: Number(casosResueltos[0].count),
      cartas_generadas: Number(cartasGeneradas[0].count),
      firmas_total: Number(totalFirmas[0].count),
      ultima_actualizacion: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error en GET /api/stats (DB no conectada?):", error);
    // Fallback para desarrollo sin DB
    return NextResponse.json({
      compromisos_total: 0,
      compromisos_activos: 0,
      casos_totales: 0,
      casos_resueltos: 0,
      cartas_generadas: 0,
      firmas_total: 0,
      ultima_actualizacion: new Date().toISOString(),
    });
  }
}
