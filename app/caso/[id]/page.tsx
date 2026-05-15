"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

interface CasoData {
  id: number;
  medicinaDenegada: string;
  autoridadNombre: string;
  autoridadCiudad: string;
  autoridadRegion: string;
  historia: string | null;
  anonimo: boolean;
  estado: string;
  firmasCount: number;
  solicitanteNombre?: string;
  tokenSeguimiento?: string;
}

export default function CasoPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const casoId = params.id as string;
  const token = searchParams.get("token");
  const signToken = searchParams.get("sign");

  const [caso, setCaso] = useState<CasoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [firmaMensaje, setFirmaMensaje] = useState("");
  const [firmaLoading, setFirmaLoading] = useState(false);

  useEffect(() => {
    async function fetchCaso() {
      try {
        const res = await fetch(`/api/case/${casoId}`);
        if (!res.ok) {
          throw new Error("Caso no encontrado");
        }
        const data = await res.json();
        setCaso(data);
      } catch {
        setError("Error al cargar el caso");
      } finally {
        setLoading(false);
      }
    }
    fetchCaso();
  }, [casoId]);

  async function handleFirma(e: React.FormEvent) {
    e.preventDefault();
    if (!signToken) return;
    setFirmaLoading(true);
    setFirmaMensaje("");

    try {
      const res = await fetch(`/api/sign?token=${signToken}`);
      const data = await res.json();
      if (res.ok) {
        setFirmaMensaje(data.mensaje);
      } else {
        setFirmaMensaje(data.error || "Error al firmar");
      }
    } catch {
      setFirmaMensaje("Error de conexión");
    } finally {
      setFirmaLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </main>
    );
  }

  if (error || !caso) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-red-600">{error || "Caso no encontrado"}</div>
      </main>
    );
  }

  const isOwner = !!token;
  const canSign = !!signToken && caso.estado === "recogiendo";

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/" className="text-primary text-sm mb-6 inline-block">
          ← Volver al inicio
        </Link>

        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                caso.estado === "recogiendo"
                  ? "bg-blue-100 text-blue-700"
                  : caso.estado === "listo"
                  ? "bg-green-100 text-green-700"
                  : caso.estado === "resuelto"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {caso.estado === "recogiendo" && "RECOGIENDO FIRMAS"}
              {caso.estado === "listo" && "CARTA LISTA"}
              {caso.estado === "resuelto" && "RESUELTO"}
              {caso.estado === "cerrado" && "CERRADO"}
            </span>
          </div>

          <h1 className="text-2xl font-bold mb-2">
            Caso #{caso.id} — {caso.medicinaDenegada} denegada
          </h1>

          <div className="text-gray-600 mb-4">
            <p>
              <strong>Centro:</strong> {caso.autoridadNombre}
            </p>
            <p>
              <strong>Ciudad:</strong> {caso.autoridadCiudad},{" "}
              {caso.autoridadRegion}
            </p>
          </div>

          {caso.historia && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-gray-700 italic">&ldquo;{caso.historia}&rdquo;</p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${Math.min((caso.firmasCount / 50) * 100, 100)}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-600">
              {caso.firmasCount}/50
            </span>
          </div>
        </div>

        {/* Owner actions */}
        {isOwner && (
          <div className="card mb-6">
            <h2 className="text-lg font-semibold mb-4">Acciones</h2>
            <div className="space-y-3">
              {caso.estado === "listo" && (
                <Link
                  href={`/carta/${caso.id}?token=${token}`}
                  className="btn-primary w-full block"
                >
                  📄 Descargar carta (PDF)
                </Link>
              )}
              <Link href="/instrucciones" className="btn-secondary w-full block">
                📋 Ver instrucciones
              </Link>
            </div>
          </div>
        )}

        {/* Sign form */}
        {canSign && (
          <div className="card mb-6">
            <h2 className="text-lg font-semibold mb-2">
              ¿Quieres firmar esta carta?
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Al firmar, tu nombre aparecerá en la carta de reclamación. El
              paciente recibirá el PDF y lo entregará donde crea conveniente.
            </p>

            {firmaMensaje && (
              <div
                className={`p-3 rounded-lg mb-4 text-sm ${
                  firmaMensaje.includes("Error") || firmaMensaje.includes("No")
                    ? "bg-red-50 text-red-700"
                    : "bg-green-50 text-green-700"
                }`}
              >
                {firmaMensaje}
              </div>
            )}

            <form onSubmit={handleFirma}>
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={firmaLoading}
              >
                {firmaLoading ? "Firmando..." : "FIRMAR ESTA CARTA"}
              </button>
            </form>
            <p className="text-xs text-gray-500 text-center mt-3">
              ¿No quieres firmar?{" "}
              <Link
                href={`/api/sign?omit=true&token=${signToken}`}
                className="text-primary underline"
              >
                Omitir este caso
              </Link>
            </p>
          </div>
        )}

        {/* Info */}
        <div className="card">
          <h3 className="font-semibold mb-2">¿Por qué 50 firmas?</h3>
          <p className="text-gray-600 text-sm">
            Con 50 nombres, la carta tiene peso. Es colectivo. Demuestra que
            hay ciudadanos que se preocupan por el acceso a medicación
            esencial.
          </p>
        </div>
      </div>
    </main>
  );
}
