"use client";

import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function CartaPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const casoId = params.id as string;
  const token = searchParams.get("token");

  if (!token) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <h1 className="text-xl font-bold mb-4">Token requerido</h1>
          <p className="text-gray-600 mb-6">
            Necesitas el enlace completo para descargar la carta.
          </p>
          <Link href="/" className="btn-primary">
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/" className="text-primary text-sm mb-6 inline-block">
          ← Volver al inicio
        </Link>

        <div className="card text-center">
          <div className="text-5xl mb-4">📄</div>
          <h1 className="text-2xl font-bold mb-4">
            Descargar carta del caso #{casoId}
          </h1>
          <p className="text-gray-600 mb-6">
            Tu carta de reclamación con todas las firmas de apoyo.
          </p>
          <a
            href={`/api/letter/${casoId}?token=${token}`}
            className="btn-primary text-lg inline-block"
            download
          >
            DESCARGAR PDF
          </a>
          <div className="mt-8 text-left">
            <h2 className="font-semibold mb-2">¿Qué hago ahora?</h2>
            <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
              <li>Descarga el PDF</li>
              <li>Imprímelo o envíalo por email</li>
              <li>Entrégalo en el centro que te negó la medicina</li>
              <li>Si no responden en 14 días, escala al Servicio de Salud</li>
            </ol>
            <Link
              href="/instrucciones"
              className="text-primary text-sm mt-4 inline-block"
            >
              Ver instrucciones completas →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
