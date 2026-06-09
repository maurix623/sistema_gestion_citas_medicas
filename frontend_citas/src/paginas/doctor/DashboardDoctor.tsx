import { useEffect, useMemo, useState } from "react";
import { FaCalendarDay, FaCheckCircle, FaClock } from "react-icons/fa";
import LayoutPortal from "../../componentes/estructura/LayoutPortal";
import { authService } from "../../servicios/auth.service";
import { citaService, type Cita } from "../../servicios/cita.service";
import { doctorService, type Doctor } from "../../servicios/doctor.service";
import { obtenerMensajeError } from "../../utilidades/apiErrores";

interface PerfilAuth {
  sub: number;
  correo: string;
  rol: string;
}

function normalizarHora(hora: string) {
  return hora.substring(0, 5);
}

function nombrePaciente(cita: Cita) {
  if (!cita.paciente?.usuario) return "Paciente no disponible";
  return `${cita.paciente.usuario.nombre} ${cita.paciente.usuario.apellido}`;
}

export default function DashboardDoctor() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  async function cargarDatos() {
    try {
      setCargando(true);
      const [perfil, doctores] = await Promise.all([
        authService.obtenerPerfil() as Promise<PerfilAuth>,
        doctorService.obtenerTodos(),
      ]);
      const doctorActual = doctores.find(
        (item) => item.usuario.id_usuario === perfil.sub,
      );

      if (!doctorActual) {
        setError("No se encontro un doctor asociado al usuario autenticado.");
        return;
      }

      setDoctor(doctorActual);
      const citasDoctor = await citaService.obtenerTodos({
        doctor: doctorActual.id_doctor,
      });
      setCitas(citasDoctor);
    } catch (error) {
      console.error(error);
      setError(obtenerMensajeError(error, "No fue posible cargar el dashboard."));
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  const hoy = new Date().toISOString().slice(0, 10);

  const metricas = [
    {
      nombre: "Citas de hoy",
      cantidad: citas.filter(
        (cita) =>
          cita.fecha === hoy &&
          ["PROGRAMADA", "CONFIRMADA"].includes(cita.estado),
      ).length,
      icono: <FaCalendarDay />,
    },
    {
      nombre: "Citas pendientes",
      cantidad: citas.filter((cita) =>
        ["PROGRAMADA", "CONFIRMADA"].includes(cita.estado),
      ).length,
      icono: <FaClock />,
    },
    {
      nombre: "Citas atendidas",
      cantidad: citas.filter((cita) => cita.estado === "ATENDIDA").length,
      icono: <FaCheckCircle />,
    },
  ];

  const proximasCitas = useMemo(
  () => [...citas]
      .filter((cita) => {
        const esProxima =
          `${cita.fecha} ${normalizarHora(cita.hora)}` >= `${hoy} 00:00`;

        const estadoValido =
          cita.estado === "PROGRAMADA" ||
          cita.estado === "CONFIRMADA";

        return esProxima && estadoValido;
      })
      .sort((a, b) =>
        `${a.fecha} ${normalizarHora(a.hora)}`.localeCompare(
          `${b.fecha} ${normalizarHora(b.hora)}`,
        ),
      )
      .slice(0, 5),
    [citas, hoy],
  );

  return (
    <LayoutPortal>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-800">
            Dashboard Doctor
          </h1>
          <p className="text-slate-500 mt-2">
            {doctor
              ? `Bienvenido, ${doctor.usuario.nombre} ${doctor.usuario.apellido}`
              : "Resumen de atencion medica"}
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
              {metricas.map((item) => (
                <div
                  key={item.nombre}
                  className="bg-white rounded-3xl shadow-lg p-6 flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-slate-500">{item.nombre}</h3>
                    <p className="text-3xl font-bold text-cyan-600 mt-2">
                      {item.cantidad}
                    </p>
                  </div>
                  <div className="text-3xl text-cyan-500">{item.icono}</div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">
                Proximas Citas
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3">Paciente</th>
                      <th className="text-left py-3">Fecha</th>
                      <th className="text-left py-3">Hora</th>
                      <th className="text-left py-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proximasCitas.map((cita) => (
                      <tr key={cita.id_cita} className="border-b">
                        <td className="py-3">{nombrePaciente(cita)}</td>
                        <td>{cita.fecha}</td>
                        <td>{normalizarHora(cita.hora)}</td>
                        <td>{cita.estado}</td>
                      </tr>
                    ))}
                    {proximasCitas.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-500">
                          No hay proximas citas.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </LayoutPortal>
  );
}
