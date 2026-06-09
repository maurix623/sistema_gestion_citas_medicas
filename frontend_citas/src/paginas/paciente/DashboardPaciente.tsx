import { useEffect, useMemo, useState } from "react";
import { FaCalendarCheck, FaFileMedical, FaUserInjured } from "react-icons/fa";
import LayoutPortal from "../../componentes/estructura/LayoutPortal";
import { authService } from "../../servicios/auth.service";
import { citaService, type Cita } from "../../servicios/cita.service";
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

function nombreDoctor(cita?: Cita) {
  if (!cita?.doctor?.usuario) return "Doctor no disponible";
  return `${cita.doctor.usuario.nombre} ${cita.doctor.usuario.apellido}`;
}

export default function DashboardPaciente() {
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [historias, setHistorias] = useState<HistoriaClinica[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  async function cargarDatos() {
    try {
      setCargando(true);
      const [perfil, pacientes] = await Promise.all([
        authService.obtenerPerfil() as Promise<PerfilAuth>,
        pacienteService.obtenerTodos(),
      ]);
      const pacienteActual = pacientes.find(
        (item) => item.usuario.id_usuario === perfil.sub,
      );

      if (!pacienteActual) {
        setError("No se encontro un paciente asociado al usuario autenticado.");
        return;
      }

      setPaciente(pacienteActual);
      const [citasPaciente, historiasTodas] = await Promise.all([
        citaService.obtenerTodos({ paciente: pacienteActual.id_paciente }),
        historiaClinicaService.obtenerTodos(),
      ]);
      setCitas(citasPaciente);
      setHistorias(
        historiasTodas.filter(
          (historia) =>
            historia.cita.paciente?.id_paciente === pacienteActual.id_paciente,
        ),
      );
    } catch (error) {
      console.error(error);
      setError(
        obtenerMensajeError(error, "No fue posible cargar el dashboard."),
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  const proximaCita = useMemo(() => {
    const hoy = new Date().toISOString().slice(0, 10);
    return [...citas]
      .filter(
        (cita) =>
          ["PROGRAMADA", "CONFIRMADA"].includes(cita.estado) &&
          `${cita.fecha} ${normalizarHora(cita.hora)}` >=
            `${hoy} 00:00`
      )
      .sort((a, b) =>
        `${a.fecha} ${normalizarHora(a.hora)}`.localeCompare(
          `${b.fecha} ${normalizarHora(b.hora)}`,
        ),
      )[0];
  }, [citas]);

  return (
    <LayoutPortal>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-800">
            Dashboard Paciente
          </h1>
          <p className="text-slate-500 mt-2">
            {paciente
              ? `Bienvenido, ${paciente.usuario.nombre} ${paciente.usuario.apellido}`
              : "Resumen de tus atenciones medicas"}
          </p>
        </div>

        {cargando ? (
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <p>Cargando dashboard...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl shadow-lg p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-slate-500">Total de citas</h3>
                  <p className="text-3xl font-bold text-cyan-600 mt-2">
                    {citas.length}
                  </p>
                </div>
                <FaCalendarCheck className="text-3xl text-cyan-500" />
              </div>
              <div className="bg-white rounded-3xl shadow-lg p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-slate-500">Historias clinicas</h3>
                  <p className="text-3xl font-bold text-cyan-600 mt-2">
                    {historias.length}
                  </p>
                </div>
                <FaFileMedical className="text-3xl text-cyan-500" />
              </div>
              <div className="bg-white rounded-3xl shadow-lg p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-slate-500">Paciente</h3>
                  <p className="text-xl font-bold text-cyan-600 mt-2">
                    {paciente?.tipo_sangre || "Activo"}
                  </p>
                </div>
                <FaUserInjured className="text-3xl text-cyan-500" />
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">
                Proxima Cita
              </h2>
              {proximaCita ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Doctor</p>
                    <p className="font-semibold">{nombreDoctor(proximaCita)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Fecha</p>
                    <p className="font-semibold">{proximaCita.fecha}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Hora</p>
                    <p className="font-semibold">
                      {normalizarHora(proximaCita.hora)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Estado</p>
                    <p className="font-semibold">{proximaCita.estado}</p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500">No tienes proximas citas.</p>
              )}
            </div>
          </>
        )}
      </div>
    </LayoutPortal>
  );
}
