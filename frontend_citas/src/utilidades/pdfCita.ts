import { jsPDF } from "jspdf";
import type { Cita } from "../servicios/cita.service";

function texto(valor?: string | null) {
  return valor && valor.trim() ? valor : "No disponible";
}

function nombreCompleto(usuario?: { nombre?: string; apellido?: string }) {
  if (!usuario) return "No disponible";
  return texto(`${usuario.nombre ?? ""} ${usuario.apellido ?? ""}`.trim());
}

function normalizarHora(hora?: string) {
  return hora ? hora.substring(0, 5) : "No disponible";
}

export function descargarComprobanteCita(cita: Cita) {
  const documento = new jsPDF();
  const fechaGeneracion = new Date().toLocaleString();
  const nombrePaciente = nombreCompleto(cita.paciente?.usuario);
  const nombreDoctor = nombreCompleto(cita.doctor?.usuario);

  documento.setFont("helvetica", "bold");
  documento.setFontSize(18);
  documento.text("Sistema de Gestion Medica", 20, 22);

  documento.setFontSize(14);
  documento.text("Comprobante de Cita Medica", 20, 34);

  documento.setDrawColor(15, 76, 154);
  documento.line(20, 40, 190, 40);

  documento.setFont("helvetica", "normal");
  documento.setFontSize(11);

  const datos = [
    ["Paciente", nombrePaciente],
    ["Doctor", nombreDoctor],
    ["Especialidad", texto(cita.doctor?.especialidad?.nombre)],
    ["Consultorio", texto(cita.doctor?.consultorio?.nombre)],
    ["Fecha de cita", texto(cita.fecha)],
    ["Hora de cita", normalizarHora(cita.hora)],
    ["Estado", texto(cita.estado)],
    ["Observaciones", texto(cita.observaciones)],
  ];

  let posicionY = 54;

  datos.forEach(([etiqueta, valor]) => {
    documento.setFont("helvetica", "bold");
    documento.text(`${etiqueta}:`, 20, posicionY);
    documento.setFont("helvetica", "normal");
    documento.text(valor, 62, posicionY, { maxWidth: 125 });
    posicionY += etiqueta === "Observaciones" ? 16 : 10;
  });

  documento.setFontSize(10);
  documento.text(`Generado: ${fechaGeneracion}`, 20, 270);
  documento.text("Documento generado automaticamente", 20, 280);

  documento.save(`comprobante-cita-${cita.id_cita}.pdf`);
}
