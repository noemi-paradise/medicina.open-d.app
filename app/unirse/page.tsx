"use client";

import { useState } from "react";
import Link from "next/link";

export default function Unirse() {
  const [form, setForm] = useState({ nombre: "", email: "", acepto: false });
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

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
    <main className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto px-4 py-12">
        <Link href="/" className="text-primary text-sm mb-6 inline-block">
          ← Volver al inicio
        </Link>
        <h1 className="text-3xl font-bold mb-4">Únete a la lista</h1>
        <p className="text-gray-600 mb-8">
          Cuando alguien necesite firmas, recibirás un email. Un clic. Tu nombre
          en la carta. Sin spam. Sin marketing. Solo apoyo.
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
    </main>
  );
}
