import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { compromisos, casos, firmas } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function GET() {
  try {
    const totalCompromisos = await db.execute(
      sql`SELECT count(*)::int as count FROM ${compromisos}`
    );

    const activosCompromisos = await db.execute(
      sql`SELECT count(*)::int as count FROM ${compromisos} WHERE activo = true`
    );

    const totalCasos = await db.execute(
      sql`SELECT count(*)::int as count FROM ${casos}`
    );

    const casosResueltos = await db.execute(
      sql`SELECT count(*)::int as count FROM ${casos} WHERE estado = 'resuelto'`
    );

    const cartasGeneradas = await db.execute(
      sql`SELECT count(*)::int as count FROM ${casos} WHERE carta_generada_en IS NOT NULL`
    );

    const totalFirmas = await db.execute(
      sql`SELECT count(*)::int as count FROM ${firmas}`
    );

    return NextResponse.json({
      compromisos_total: Number((totalCompromisos.rows[0] as any).count),
      compromisos_activos: Number((activosCompromisos.rows[0] as any).count),
      casos_totales: Number((totalCasos.rows[0] as any).count),
      casos_resueltos: Number((casosResueltos.rows[0] as any).count),
      cartas_generadas: Number((cartasGeneradas.rows[0] as any).count),
      firmas_total: Number((totalFirmas.rows[0] as any).count),
      ultima_actualizacion: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error en GET /api/stats:", error);
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
/* eslint-enable @typescript-eslint/no-explicit-any */
