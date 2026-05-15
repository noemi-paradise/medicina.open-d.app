import Link from "next/link";

export const metadata = {
  title: "FAQ — medicina.open-d.app",
};

export default function FAQ() {
  const faqs = [
    {
      q: "¿Qué es medicina.open-d.app?",
      a: "Es una plataforma para que pacientes a los que se les niega medicación para diabetes recojan firmas de apoyo y generen cartas formales de reclamación. No somos una ONG ni una empresa. Somos una herramienta ciudadana.",
    },
    {
      q: "¿Cuesta dinero?",
      a: "No. Es completamente gratuita. Ni para crear casos, ni para firmar, ni para descargar la carta.",
    },
    {
      q: "¿Quién entrega la carta?",
      a: "El paciente. Nosotros generamos el PDF con las firmas, pero el paciente es quien lo entrega al centro de salud, hospital o autoridad correspondiente.",
    },
    {
      q: "¿Cuántas firmas necesito?",
      a: "Con 50 firmas la carta tiene peso suficiente. Pero puedes seguir recogiendo más si lo necesitas.",
    },
    {
      q: "¿Puedo crear más de un caso?",
      a: "Solo puedes tener un caso activo cada 30 días. Esto evita el abuso del sistema.",
    },
    {
      q: "¿Mis datos están seguros?",
      a: "Solo almacenamos nombre, email, hash del email, IP básica y fechas. No guardamos historial médico, DNI ni dirección postal. Puedes darte de baja en cualquier momento.",
    },
    {
      q: "¿Qué pasa si alguien crea un caso falso?",
      a: "Cada caso tiene un botón de denunciar. Con 3 reportes, el caso se pausa automáticamente para revisión.",
    },
    {
      q: "¿Funciona fuera de España?",
      a: "Por ahora está diseñada para España, pero el código es abierto y puede adaptarse a otros países.",
    },
  ];

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="text-primary text-sm mb-6 inline-block">
          ← Volver al inicio
        </Link>
        <h1 className="text-3xl font-bold mb-8">Preguntas frecuentes</h1>

        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="card">
              <h2 className="text-lg font-semibold mb-2">{faq.q}</h2>
              <p className="text-gray-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
