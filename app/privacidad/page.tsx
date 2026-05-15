import Link from "next/link";

export const metadata = {
  title: "Privacidad — medicina.open-d.app",
};

export default function Privacidad() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="text-primary text-sm mb-6 inline-block">
          ← Volver al inicio
        </Link>
        <h1 className="text-3xl font-bold mb-8">Política de privacidad</h1>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Responsable</h2>
            <p className="text-gray-600">
              medicina.open-d.app es una plataforma ciudadana gestionada por el
              colectivo Open-D. Puedes contactarnos en cualquier momento para
              ejercer tus derechos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Qué datos recogemos</h2>
            <ul className="text-gray-600 list-disc list-inside space-y-1">
              <li>Nombre (para aparecer en la carta)</li>
              <li>Email (para enviarte notificaciones)</li>
              <li>Hash del email (para evitar duplicados)</li>
              <li>IP y User-Agent básicos (para anti-abuso)</li>
              <li>Fechas de creación y firma</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Qué NO recogemos</h2>
            <ul className="text-gray-600 list-disc list-inside space-y-1">
              <li>Tipo de diabetes</li>
              <li>Historial médico</li>
              <li>DNI/NIE</li>
              <li>Dirección postal</li>
              <li>Datos de salud</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Finalidad</h2>
            <p className="text-gray-600">
              Los datos se utilizan exclusivamente para:
            </p>
            <ul className="text-gray-600 list-disc list-inside space-y-1 mt-2">
              <li>Gestionar la lista de personas comprometidas</li>
              <li>Enviar emails de notificación cuando hay un caso nuevo</li>
              <li>Generar la carta de reclamación con las firmas</li>
              <li>Prevenir abusos (rate limits, anti-spam)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Base legal</h2>
            <p className="text-gray-600">
              El tratamiento se basa en el consentimiento explícito que das al
              unirte a la lista o crear un caso. Puedes retirar tu consentimiento
              en cualquier momento.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Tus derechos</h2>
            <ul className="text-gray-600 list-disc list-inside space-y-1">
              <li>
                <strong>Acceso:</strong> Solicitar qué datos tenemos tuyos
              </li>
              <li>
                <strong>Rectificación:</strong> Corregir datos incorrectos
              </li>
              <li>
                <strong>Supresión:</strong> Pedir que eliminemos tus datos
              </li>
              <li>
                <strong>Oposición:</strong> Dejar de recibir emails
              </li>
            </ul>
            <p className="text-gray-600 mt-2">
              Para ejercer estos derechos, responde a cualquier email nuestro o
              contacta a través de open-d.app.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Conservación</h2>
            <p className="text-gray-600">
              Si te das de baja, marcamos tu cuenta como inactiva pero no
              borramos tus datos pasados (para mantener la integridad de las
              firmas que ya hayas hecho). Los casos cerrados se mantienen 2
              años y luego se anonimizan.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Cookies</h2>
            <p className="text-gray-600">
              No usamos cookies de seguimiento. Solo cookies técnicas
              necesarias para el funcionamiento de la plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Cambios</h2>
            <p className="text-gray-600">
              Podemos actualizar esta política. Te notificaremos por email si
              hay cambios significativos.
            </p>
          </section>

          <p className="text-sm text-gray-500 mt-8">
            Última actualización: 15 de mayo de 2026
          </p>
        </div>
      </div>
    </main>
  );
}
