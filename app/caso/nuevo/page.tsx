"use client";

import { useState } from "react";
import Link from "next/link";

const MEDICINAS = [
  "Insulina rápida",
  "Insulina lenta",
  "Tiras reactivas",
  "Sensor CGM",
  "Transmisor CGM",
  "Agujas / jeringas",
  "Material bomba",
];

const REGIONES = [
  "Andalucía",
  "Aragón",
  "Asturias",
  "Baleares",
  "Canarias",
  "Cantabria",
  "Castilla y León",
  "Castilla-La Mancha",
  "Cataluña",
  "Extremadura",
  "Galicia",
  "La Rioja",
  "Madrid",
  "Murcia",
  "Navarra",
  "País Vasco",
  "Valencia",
  "Ceuta",
  "Melilla",
];

const TIPOS = [
  { value: "centro_salud", label: "Centro de Salud" },
  { value: "hospital", label: "Hospital" },
  { value: "farmacia", label: "Farmacia" },
  { value: "otro", label: "Otro" },
];

export default function NuevoCaso() {
  const [form, setForm] = useState({
    medicinaDenegada: "",
    medicinaOtra: "",
    autoridadNombre: "",
    autoridadCiudad: "",
    autoridadRegion: "",
    autoridadTipo: "",
    historia: "",
    anonimo: false,
    solicitanteNombre: "",
    solicitanteEmail: "",
  });
  const [loading, setLoading] = useState(false);
  interface CasoResult {
    mensaje: string;
    caso_id: number;
    token_seguimiento: string;
    url_publica: string;
    url_seguimiento: string;
  }
  const [resultado, setResultado] = useState<CasoResult | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResultado(null);

    try {
      const res = await fetch("/api/case", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          recaptchaToken: "mock-token", // TODO: integrate reCAPTCHA v3
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResultado(data);
      } else {
        setError(data.error || "Error al crear el caso");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  if (resultado) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="card max-w-lg w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold mb-4">¡Caso creado!</h1>
          <p className="text-gray-600 mb-6">{resultado.mensaje}</p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-500 mb-1">Tu enlace de seguimiento:</p>
            <a
              href={resultado.url_seguimiento}
              className="text-primary break-all text-sm"
            >
              {resultado.url_seguimiento}
            </a>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Guarda este enlace. Lo necesitarás para descargar tu carta.
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
        <h1 className="text-3xl font-bold mb-2">¿Te han negado tu medicina?</h1>
        <p className="text-gray-600 mb-8">
          Cuéntanos qué pasó. Crearemos tu carta de reclamación.
        </p>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">
              1. ¿Qué te negaron?
            </h2>
            <select
              className="input-field mb-3"
              value={form.medicinaDenegada}
              onChange={(e) =>
                setForm({ ...form, medicinaDenegada: e.target.value })
              }
              required
            >
              <option value="">Selecciona...</option>
              {MEDICINAS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
              <option value="Otro">Otro</option>
            </select>
            {form.medicinaDenegada === "Otro" && (
              <input
                type="text"
                className="input-field"
                placeholder="Especifica qué te negaron"
                value={form.medicinaOtra}
                onChange={(e) =>
                  setForm({ ...form, medicinaOtra: e.target.value })
                }
                required
              />
            )}
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">
              2. ¿Dónde te la negaron?
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Centro / Hospital / Farmacia
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ej: Centro de Salud Dr. Lemierre"
                  value={form.autoridadNombre}
                  onChange={(e) =>
                    setForm({ ...form, autoridadNombre: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ciudad</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ej: Málaga"
                  value={form.autoridadCiudad}
                  onChange={(e) =>
                    setForm({ ...form, autoridadCiudad: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Comunidad Autónoma
                </label>
                <select
                  className="input-field"
                  value={form.autoridadRegion}
                  onChange={(e) =>
                    setForm({ ...form, autoridadRegion: e.target.value })
                  }
                  required
                >
                  <option value="">Selecciona...</option>
                  {REGIONES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <select
                  className="input-field"
                  value={form.autoridadTipo}
                  onChange={(e) =>
                    setForm({ ...form, autoridadTipo: e.target.value })
                  }
                  required
                >
                  <option value="">Selecciona...</option>
                  {TIPOS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">
              3. Tu historia (opcional)
            </h2>
            <textarea
              className="input-field min-h-[120px]"
              placeholder="Cuéntanos qué pasó..."
              value={form.historia}
              onChange={(e) =>
                setForm({ ...form, historia: e.target.value })
              }
            />
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">
              4. ¿Quieres anonimato público?
            </h2>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1"
                checked={form.anonimo}
                onChange={(e) =>
                  setForm({ ...form, anonimo: e.target.checked })
                }
              />
              <span className="text-sm text-gray-600">
                Sí, no muestres mi nombre en la página pública del caso
              </span>
            </label>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">
              5. Tus datos (para recibir la carta)
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  className="input-field"
                  value={form.solicitanteNombre}
                  onChange={(e) =>
                    setForm({ ...form, solicitanteNombre: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="input-field"
                  value={form.solicitanteEmail}
                  onChange={(e) =>
                    setForm({ ...form, solicitanteEmail: e.target.value })
                  }
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full text-lg"
            disabled={loading}
          >
            {loading ? "Creando..." : "CREAR MI CARTA DE RECLAMACIÓN"}
          </button>
        </form>
      </div>
    </main>
  );
}
