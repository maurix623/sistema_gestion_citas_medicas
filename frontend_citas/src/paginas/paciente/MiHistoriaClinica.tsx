import { useEffect, useMemo, useState } from "react";
import LayoutPortal from "../../componentes/estructura/LayoutPortal";
import { authService } from "../../servicios/auth.service";
import {
  historiaClinicaService,
  type HistoriaClinica,
} from "../../servicios/historiaClinica.service";
import { pacienteService, type Paciente } from "../../servicios/paciente.service";
import { obtenerMensajeError } from "../../utilidades/apiErrores";

interface PerfilAuth {
  sub: number;
  correo: string;
  rol: string;
}

function normalizarHora(hora?: string) {
  return hora ? hora.substring(0, 5) : "";
}

function nombreDoctor(historia: HistoriaClinica) {
  if (!historia.cita?.doctor?.usuario) return "Doctor no disponible";
  return `${historia.cita.doctor.usuario.nombre} ${historia.cita.doctor.usuario.apellido}`;
}

export default function MiHistoriaClinica() {
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [historias, setHistorias] = useState<HistoriaClinica[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  async function cargarHistorias() {
    try {
      setCargando(true);
      const [perfil, pacientes, historiasTodas] = await Promise.all([
        authService.obtenerPerfil() as Promise<PerfilAuth>,
        pacienteService.obtenerTodos(),
        historiaClinicaService.obtenerTodos(),
      ]);
      const pacienteActual = pacientes.find(
        (item) => item.usuario.id_usuario === perfil.sub,
      );

      if (!pacienteActual) {
        setError("No se encontro un paciente asociado al usuario autenticado.");
        return;
      }

      setPaciente(pacienteActual);
      setHistorias(
        historiasTodas.filter(
          (historia) =>
            historia.cita.paciente?.id_paciente === pacienteActual.id_paciente,
        ),
      );
    } catch (error) {
      console.error(error);
      setError(
        obtenerMensajeError(
          error,
          "No fue posible cargar tus historias clinicas.",
        ),
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarHistorias();
  }, []);

  const historiasFiltradas = useMemo(
    () =>
      historias.filter((historia) =>
        `${historia.cita?.fecha ?? ""} ${nombreDoctor(historia)} ${
          historia.diagnostico
        } ${historia.tratamiento ?? ""} ${historia.notas_medicas ?? ""}`
          .toLowerCase()
          .includes(busqueda.toLowerCase()),
      ),
    [busqueda, historias],
  );

  return (
    <LayoutPortal>
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-cyan-600">
              Mis Historias Clinicas
            </h1>
            {paciente && (
              <p className="text-slate-500 mt-1">
                {paciente.usuario.nombre} {paciente.usuario.apellido}
              </p>
            )}
          </div>
          <input
            type="text"
            placeholder="Buscar historia..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="border border-slate-300 rounded-xl px-4 py-3 w-80 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {cargando ? (
          <p>Cargando historias clinicas...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Fecha</th>
                  <th className="text-left py-3">Doctor</th>
                  <th className="text-left py-3">Diagnostico</th>
                  <th className="text-left py-3">Tratamiento</th>
                  <th className="text-left py-3">Notas</th>
                </tr>
              </thead>
              <tbody>
                {historiasFiltradas.map((historia) => (
                  <tr key={historia.id_historia} className="border-b">
                    <td className="py-3">
                      {historia.cita?.fecha ?? "No disponible"}{" "}
                      {normalizarHora(historia.cita?.hora)}
                    </td>
                    <td>{nombreDoctor(historia)}</td>
                    <td>{historia.diagnostico}</td>
                    <td>{historia.tratamiento || "No registrado"}</td>
                    <td>{historia.notas_medicas || "No registrado"}</td>
                  </tr>
                ))}
                {historiasFiltradas.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      No se encontraron historias clinicas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </LayoutPortal>
  );
}
