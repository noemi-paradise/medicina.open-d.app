import { PDFDocument, rgb, StandardFonts, PDFFont } from "pdf-lib";

export interface CasoData {
  id: number;
  solicitanteNombre: string;
  medicinaDenegada: string;
  autoridadNombre: string;
  autoridadCiudad: string;
  autoridadRegion: string;
  historia: string | null;
  firmas: string[];
}

export async function generateLetter(caso: CasoData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 60;
  let y = 842 - margin;

  const drawText = (
    text: string,
    size: number,
    bold = false,
    color = rgb(0.1, 0.1, 0.18)
  ) => {
    const f = bold ? fontBold : font;
    const lines = wrapText(text, size, 595 - margin * 2, f);
    for (const line of lines) {
      page.drawText(line, {
        x: margin,
        y,
        size,
        font: f,
        color,
      });
      y -= size * 1.4;
    }
  };

  // Title
  drawText("CARTA DE RECLAMACIÓN", 18, true, rgb(0, 0.4, 1));
  y -= 8;

  // Date
  const fecha = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  drawText(`Fecha: ${fecha}`, 11);
  y -= 12;

  // Separator
  y -= 4;
  page.drawLine({
    start: { x: margin, y },
    end: { x: 595 - margin, y },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  y -= 16;

  // From / To
  drawText(`De: ${caso.solicitanteNombre}`, 11);
  drawText(`Para: ${caso.autoridadNombre}`, 11);
  drawText(`Ciudad: ${caso.autoridadCiudad}`, 11);
  drawText(`Comunidad Autónoma: ${caso.autoridadRegion}`, 11);
  y -= 8;

  drawText(
    `Asunto: Reclamación de tratamiento esencial para diabetes`,
    11,
    true
  );
  drawText(`Referencia: medicina.open-d.app/caso/${caso.id}`, 11);
  y -= 12;

  page.drawLine({
    start: { x: margin, y },
    end: { x: 595 - margin, y },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  y -= 16;

  // Body
  drawText("Estimado/a responsable:", 11, true);
  y -= 4;
  drawText(
    "Me dirijo a usted en relación con la denegación de tratamiento esencial para mi diabetes.",
    11
  );
  y -= 8;

  drawText("TRATAMIENTO DENEGADO:", 11, true);
  drawText(caso.medicinaDenegada, 11);
  y -= 4;
  drawText("CENTRO:", 11, true);
  drawText(caso.autoridadNombre, 11);
  drawText(`CIUDAD: ${caso.autoridadCiudad}, ${caso.autoridadRegion}`, 11);
  y -= 8;

  if (caso.historia) {
    drawText("HISTORIA DEL PACIENTE:", 11, true);
    drawText(caso.historia, 10);
    y -= 8;
  }

  page.drawLine({
    start: { x: margin, y },
    end: { x: 595 - margin, y },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  y -= 16;

  // Firmas
  drawText("APOYO COLECTIVO", 12, true, rgb(0, 0.4, 1));
  y -= 4;
  drawText(
    `Esta carta cuenta con el respaldo de ${caso.firmas.length} ciudadanos que se han comprometido a apoyar a diabéticos a los que se les niega tratamiento esencial:`,
    10
  );
  y -= 8;

  for (let i = 0; i < caso.firmas.length; i++) {
    drawText(`${i + 1}. ${caso.firmas[i]}`, 10);
    if (y < 100) {
      // New page if running out of space
      pdfDoc.addPage([595, 842]);
      y = 842 - margin;
    }
  }

  y -= 8;
  page.drawLine({
    start: { x: margin, y },
    end: { x: 595 - margin, y },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  y -= 16;

  // Legal
  drawText("BASE LEGAL", 11, true, rgb(0, 0.4, 1));
  y -= 4;
  drawText(
    "Le recordamos que el acceso a medicación esencial es un derecho fundamental reconocido en:",
    10
  );
  y -= 4;
  drawText(
    "• Constitución Española, Artículo 43 — Derecho a la protección de la salud",
    10
  );
  drawText(
    "• Declaración Universal de Derechos Humanos, Artículo 25",
    10
  );
  drawText(
    "• Constitución de la OMS — Derecho al más alto nivel posible de salud",
    10
  );
  y -= 12;

  drawText("SOLICITAMOS RESPETUOSAMENTE:", 11, true);
  drawText("1. Provisión inmediata del tratamiento denegado", 10);
  drawText("2. Explicación escrita de la causa de la denegación", 10);
  drawText("3. Plazo para la resolución", 10);
  y -= 12;

  drawText(
    "Si esta reclamación no obtiene respuesta en 14 días, el paciente se reserva el derecho de escalar ante el Servicio de Salud de la comunidad autónoma, el Defensor del Paciente, el Ministerio de Sanidad y organizaciones de pacientes (FEDE, DiabetesCERO).",
    10
  );
  y -= 20;

  page.drawLine({
    start: { x: margin, y },
    end: { x: 595 - margin, y },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  y -= 16;

  drawText("Atentamente y con urgencia,", 11);
  y -= 4;
  drawText(caso.solicitanteNombre, 11, true);
  y -= 4;
  drawText(`En nombre de ${caso.firmas.length} personas de apoyo`, 10);
  drawText("medicina.open-d.app", 10, false, rgb(0.4, 0.4, 0.4));

  return pdfDoc.save();
}

function wrapText(
  text: string,
  size: number,
  maxWidth: number,
  font: PDFFont
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? currentLine + " " + word : word;
    const width = font.widthOfTextAtSize(testLine, size);
    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  return lines;
}
