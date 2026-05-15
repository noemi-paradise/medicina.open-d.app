import Link from "next/link";

export const metadata = {
  title: "Instrucciones — medicina.open-d.app",
};

export default function Instrucciones() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="text-primary text-sm mb-6 inline-block">
          ← Volver al inicio
        </Link>
        <h1 className="text-3xl font-bold mb-8">Cómo usar tu carta</h1>

        <div className="space-y-8">
          <section className="card">
            <h2 className="text-xl font-semibold mb-4 text-primary">
              Opción 1: Email (rápido)
            </h2>
            <p className="text-gray-600 mb-4">
              Adjunta el PDF a un email.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 font-mono whitespace-pre-wrap">
{`Para: [tu doctor / centro de salud / hospital]
Asunto: Reclamación de tratamiento — Apoyo colectivo

Estimado/a:

Adjunto carta formal con el apoyo de N ciudadanos
sobre la denegación de mi tratamiento de diabetes.

Solicito revisión urgente de mi caso.

Un saludo,
[Tu nombre]
[Teléfono]`}
            </div>
          </section>

          <section className="card">
            <h2 className="text-xl font-semibold mb-4 text-primary">
              Opción 2: En persona (más impacto)
            </h2>
            <ol className="text-gray-600 space-y-2 list-decimal list-inside">
              <li>Imprime la carta</li>
              <li>Pide cita</li>
              <li>Llévala: &ldquo;Tengo N personas que apoyan mi solicitud&rdquo;</li>
            </ol>
          </section>

          <section className="card">
            <h2 className="text-xl font-semibold mb-4 text-primary">
              Opción 3: Correo certificado
            </h2>
            <p className="text-gray-600">
              Más formal. Más registro. Envía la carta impresa por correo
              certificado para tener constancia de entrega.
            </p>
          </section>

          <section className="card">
            <h2 className="text-xl font-semibold mb-4 text-primary">
              ¿Dónde enviar?
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Primero:</h3>
                <ul className="text-gray-600 list-disc list-inside text-sm">
                  <li>Tu médico de cabecera</li>
                  <li>El centro que te negó la medicina</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-1">
                  Si no responden en 14 días:
                </h3>
                <ul className="text-gray-600 list-disc list-inside text-sm">
                  <li>Servicio de Salud de tu comunidad (SAS, CatSalut...)</li>
                  <li>Defensor del Paciente de tu comunidad</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-1">Si sigue sin respuesta:</h3>
                <ul className="text-gray-600 list-disc list-inside text-sm">
                  <li>Ministerio de Sanidad</li>
                  <li>Prensa / redes sociales</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="card border-l-4 border-alert">
            <h2 className="text-xl font-semibold mb-4">Consejos</h2>
            <ul className="text-gray-600 space-y-2 list-disc list-inside">
              <li>Sé educado pero firme</li>
              <li>Pide número de registro de tu solicitud</li>
              <li>Guarda copia de todo lo que envíes</li>
              <li>Tu tratamiento es un derecho, no un favor</li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
