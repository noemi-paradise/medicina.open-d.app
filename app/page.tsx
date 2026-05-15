"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Stats {
  compromisos_total: number;
  compromisos_activos: number;
  casos_totales: number;
  casos_resueltos: number;
  cartas_generadas: number;
  firmas_total: number;
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [form, setForm] = useState({ nombre: "", email: "", acepto: false });
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMensaje("");
    setError("");

    try {
      const res = await fetch("/api/pledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje(data.mensaje);
        setForm({ nombre: "", email: "", acepto: false });
      } else {
        setError(data.error || "Error al enviar");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Nadie sin su{" "}
            <span className="text-primary">medicina</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            ¿Te han negado insulina, tiras, sensores o agujas? Recoge firmas,
            genera una carta formal y reclama tu tratamiento.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/caso/nuevo" className="btn-primary text-lg">
              Crear mi caso
            </Link>
            <a href="#unirse" className="btn-secondary text-lg">
              Unirme a la lista
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="bg-primary text-white py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold">
                  {stats.compromisos_total.toLocaleString()}
                </div>
                <div className="text-sm opacity-90">comprometidos</div>
              </div>
              <div>
                <div className="text-3xl font-bold">
                  {stats.casos_totales}
                </div>
                <div className="text-sm opacity-90">casos creados</div>
              </div>
              <div>
                <div className="text-3xl font-bold">
                  {stats.casos_resueltos}
                </div>
                <div className="text-sm opacity-90">resueltos</div>
              </div>
              <div>
                <div className="text-3xl font-bold">
                  {stats.firmas_total.toLocaleString()}
                </div>
                <div className="text-sm opacity-90">firmas</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          ¿Cómo funciona?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card text-center">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">1. Creas tu caso</h3>
            <p className="text-gray-600">
              Cuéntanos qué te negaron, dónde y por qué. 2 minutos.
            </p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-4">✋</div>
            <h3 className="text-xl font-semibold mb-2">
              2. Recogemos firmas
            </h3>
            <p className="text-gray-600">
              Nuestra lista de personas comprometidas firma tu carta. 1 click.
            </p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-xl font-semibold mb-2">
              3. Generas tu carta
            </h3>
            <p className="text-gray-600">
              Descargas el PDF con todas las firmas y lo entregas donde
              corresponda.
            </p>
          </div>
        </div>
      </section>

      {/* Join form */}
      <section id="unirse" className="bg-white border-t border-gray-100">
        <div className="max-w-xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center mb-4">
            Únete a la lista
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Cuando alguien necesite firmas, recibirás un email. Un clic. Tu
            nombre en la carta.
          </p>

          {mensaje && (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6">
              {mensaje}
            </div>
          )}
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input
                type="text"
                className="input-field"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Tu nombre completo"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                className="input-field"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="tu@email.com"
                required
              />
            </div>
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="acepto"
                className="mt-1"
                checked={form.acepto}
                onChange={(e) => setForm({ ...form, acepto: e.target.checked })}
                required
              />
              <label htmlFor="acepto" className="text-sm text-gray-600">
                Me comprometo a firmar cartas de apoyo cuando alguien las
                necesite. Máximo un email por caso. Acepto la{" "}
                <Link href="/privacidad" className="text-primary underline">
                  política de privacidad
                </Link>
                .
              </label>
            </div>
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? "Enviando..." : "COMPROMETERME — 10 SEGUNDOS"}
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-sm">
            <div>
              <h4 className="font-semibold mb-4">medicina.open-d.app</h4>
              <p className="text-gray-400">
                Nadie sin su medicina. Plataforma de apoyo colectivo para
                pacientes con diabetes.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Enlaces</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/faq" className="hover:text-white">
                    Preguntas frecuentes
                  </Link>
                </li>
                <li>
                  <Link href="/instrucciones" className="hover:text-white">
                    Instrucciones
                  </Link>
                </li>
                <li>
                  <Link href="/privacidad" className="hover:text-white">
                    Privacidad
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <p className="text-gray-400">
                Esta plataforma no sustituye el asesoramiento médico ni legal.
                Es una herramienta de apoyo ciudadano.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
