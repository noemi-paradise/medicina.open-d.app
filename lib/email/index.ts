import { Resend } from "resend";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://medicina.open-d.app";
const FROM_EMAIL = "medicina@open-d.app";

let resendInstance: Resend | null = null;

function getResend() {
  if (!resendInstance && process.env.RESEND_API_KEY) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

function isValidEmailForSending(email: string): boolean {
  // Strict validation to prevent header injection
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email) &&
    !/[\r\n,;]/.test(email) &&
    email.length <= 254;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!isValidEmailForSending(to)) {
    console.warn("Invalid email address, not sent:", to);
    return { id: "invalid-email" };
  }
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not set, email not sent:", subject);
    return { id: "mock-email-id" };
  }
  const result = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  });
  return result;
}

export function getConfirmEmailHtml(nombre: string, token: string): string {
  const url = `${APP_URL}/api/pledge/confirm?token=${token}`;
  return `
    <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; color: #1A1A2E;">
      <h2 style="color: #0066FF;">Hola ${nombre},</h2>
      <p>Gracias por unirte a la lista de apoyo.</p>
      <p>Para activar tu compromiso, haz clic aquí:</p>
      <a href="${url}" style="display: inline-block; background: #0066FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">CONFIRMAR — medicina.open-d.app</a>
      <p style="margin-top: 24px; color: #666;">Si no fuiste tú, ignora este email.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
      <p style="color: #666; font-size: 14px;"><strong>¿Qué significa esto?</strong></p>
      <ul style="color: #666; font-size: 14px;">
        <li>Cuando un diabético sea negado su medicina, recibirás un email.</li>
        <li>Un clic. Tu nombre en la carta.</li>
        <li>Sin spam. Sin marketing. Solo apoyo.</li>
      </ul>
      <p style="color: #999; font-size: 12px; margin-top: 24px;">medicina.open-d.app</p>
    </div>
  `;
}

export function getWelcomeEmailHtml(nombre: string): string {
  return `
    <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; color: #1A1A2E;">
      <h2 style="color: #0066FF;">¡Bienvenido/a, ${nombre}!</h2>
      <p>Ya formas parte de la lista de apoyo de <strong>medicina.open-d.app</strong>.</p>
      <p>Cuando alguien necesite firmas para reclamar su medicina, recibirás un email con un solo clic para firmar.</p>
      <p style="color: #999; font-size: 12px; margin-top: 24px;">medicina.open-d.app</p>
    </div>
  `;
}

export function getCaseCreatedEmailHtml(
  nombre: string,
  casoId: number,
  token: string
): string {
  const url = `${APP_URL}/caso/${casoId}?token=${token}`;
  return `
    <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; color: #1A1A2E;">
      <h2 style="color: #0066FF;">Hola ${nombre},</h2>
      <p>Tu caso <strong>#${casoId}</strong> está recogiendo firmas.</p>
      <p>Te avisaremos cuando esté listo. Puedes seguir el estado aquí:</p>
      <a href="${url}" style="display: inline-block; background: #0066FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">SEGUIR MI CASO</a>
      <p style="color: #999; font-size: 12px; margin-top: 24px;">medicina.open-d.app</p>
    </div>
  `;
}

export function getSignatureRequestEmailHtml(
  nombre: string,
  casoId: number,
  medicina: string,
  centro: string,
  ciudad: string,
  signToken: string
): string {
  const url = `${APP_URL}/caso/${casoId}?sign=${signToken}`;
  const omitUrl = `${APP_URL}/api/sign?omit=true&token=${signToken}`;
  return `
    <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; color: #1A1A2E;">
      <h2 style="color: #0066FF;">Hola ${nombre},</h2>
      <p>Alguien fue negado: <strong>${medicina}</strong> en <strong>${centro}, ${ciudad}</strong>.</p>
      <p><strong>¿Qué estás firmando?</strong><br>Una carta formal de reclamación que el paciente usará para exigir su tratamiento. Tu nombre aparecerá en la carta junto a otros firmantes.</p>
      <a href="${url}" style="display: inline-block; background: #0066FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">VER CASO Y FIRMAR</a>
      <p style="margin-top: 16px;"><a href="${omitUrl}" style="color: #666; font-size: 14px;">¿No quieres firmar este caso? Omitir</a></p>
      <p style="color: #999; font-size: 12px; margin-top: 24px;">medicina.open-d.app</p>
    </div>
  `;
}

export function getSignatureConfirmedEmailHtml(
  nombre: string,
  casoId: number,
  medicina: string,
  centro: string,
  ciudad: string
): string {
  const url = `${APP_URL}/caso/${casoId}`;
  return `
    <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; color: #1A1A2E;">
      <h2 style="color: #0066FF;">Has firmado — gracias</h2>
      <p>Hola ${nombre},</p>
      <p>Has firmado la carta de apoyo para el caso <strong>#${casoId}</strong>:<br>${medicina} denegada en ${centro}, ${ciudad}.</p>
      <p>Cuando la carta esté completa, recibirás una copia del PDF.</p>
      <p style="margin-top: 16px;"><a href="${url}" style="color: #666; font-size: 14px;">Ver caso</a></p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
      <p style="color: #666; font-size: 14px;">¿Quieres dejar de recibir peticiones? <a href="${APP_URL}/api/pledge/confirm?token=UNSUBSCRIBE">Eliminar mi compromiso</a></p>
      <p style="color: #999; font-size: 12px; margin-top: 24px;">medicina.open-d.app</p>
    </div>
  `;
}

export function getMilestoneEmailHtml(
  nombre: string,
  casoId: number,
  firmas: number,
  token: string
): string {
  const url = `${APP_URL}/caso/${casoId}?token=${token}`;
  return `
    <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; color: #1A1A2E;">
      <h2 style="color: #00C853;">¡Ya tienes ${firmas} firmas!</h2>
      <p>Hola ${nombre},</p>
      <p>Tu caso <strong>#${casoId}</strong> ya tiene <strong>${firmas}</strong> firmas de apoyo.</p>
      <a href="${url}" style="display: inline-block; background: #0066FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">SEGUIR MI CASO</a>
      <p style="color: #999; font-size: 12px; margin-top: 24px;">medicina.open-d.app</p>
    </div>
  `;
}

export function getLetterReadyEmailHtml(
  nombre: string,
  casoId: number,
  token: string
): string {
  const url = `${APP_URL}/carta/${casoId}?token=${token}`;
  return `
    <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; color: #1A1A2E;">
      <h2 style="color: #00C853;">Tu carta está lista</h2>
      <p>Hola ${nombre},</p>
      <p>Tu caso <strong>#${casoId}</strong> tiene 50 firmas. ¡Ya puedes descargar tu carta!</p>
      <a href="${url}" style="display: inline-block; background: #0066FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">DESCARGAR CARTA (PDF)</a>
      <p style="margin-top: 16px;"><a href="${APP_URL}/instrucciones" style="color: #666; font-size: 14px;">¿Qué hago ahora? Ver instrucciones</a></p>
      <p style="color: #999; font-size: 12px; margin-top: 24px;">medicina.open-d.app</p>
    </div>
  `;
}

export function getLetterCopyEmailHtml(
  nombre: string,
  casoId: number,
  pdfUrl: string
): string {
  return `
    <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; color: #1A1A2E;">
      <h2 style="color: #0066FF;">Copia de la carta completada</h2>
      <p>Hola ${nombre},</p>
      <p>La carta del caso <strong>#${casoId}</strong> ya está completa. Aquí tienes una copia:</p>
      <a href="${pdfUrl}" style="display: inline-block; background: #0066FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">DESCARGAR PDF</a>
      <p style="color: #999; font-size: 12px; margin-top: 24px;">medicina.open-d.app</p>
    </div>
  `;
}

export function getCaseResolvedEmailHtml(
  nombre: string,
  casoId: number,
  medicina: string,
  ciudad: string
): string {
  return `
    <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; color: #1A1A2E;">
      <h2 style="color: #00C853;">¡Caso resuelto! Gracias por firmar</h2>
      <p>Hola ${nombre},</p>
      <p>La carta que firmaste (caso <strong>#${casoId}</strong>, ${medicina} denegada en ${ciudad}) ha sido marcada como <strong>RESUELTA</strong>.</p>
      <p>El paciente consiguió su medicina.</p>
      <p style="color: #666;">Tu firma ayudó. Gracias.</p>
      <p style="color: #999; font-size: 12px; margin-top: 24px;">medicina.open-d.app</p>
    </div>
  `;
}

export function getUnsubscribeEmailHtml(nombre: string): string {
  return `
    <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; color: #1A1A2E;">
      <h2 style="color: #0066FF;">Eliminado de la lista</h2>
      <p>Hola ${nombre},</p>
      <p>Has sido eliminado de la lista de apoyo de medicina.open-d.app.</p>
      <p style="color: #666;">Ya no recibirás más peticiones de firma.</p>
      <p style="color: #999; font-size: 12px; margin-top: 24px;">medicina.open-d.app</p>
    </div>
  `;
}
