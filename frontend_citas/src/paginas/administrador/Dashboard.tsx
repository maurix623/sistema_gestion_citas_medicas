import { useEffect, useMemo, useState } from "react";
import {FaCalendarCheck,FaCheckCircle,FaClock,FaSignOutAlt,FaUserInjured,FaUserMd,FaUsers,} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {Bar,BarChart,CartesianGrid,ResponsiveContainer,Tooltip,XAxis,YAxis,} from "recharts";
import LayoutPortal from "../../componentes/estructura/LayoutPortal";
import { authService } from "../../servicios/auth.service";
import { citaService, type Cita, type EstadoCita } from "../../servicios/cita.service";
import { doctorService } from "../../servicios/doctor.service";
import { logAccesoService, type LogAcceso } from "../../servicios/logAcceso.service";
import { pacienteService } from "../../servicios/paciente.service";
import { usuarioService } from "../../servicios/usuario.service";
import { obtenerMensajeError } from "../../utilidades/apiErrores";
import { cerrarSesion } from "../../utilidades/jwt";

const ESTADOS_CITA: EstadoCita[] = ["PROGRAMADA","CONFIRMADA","ATENDIDA","CANCELADA",];

function normalizarHora(hora: string) {
  return hora.substring(0, 5);
}

function nombrePaciente(cita: Cita) {
  if (!cita.paciente?.usuario) return "Paciente no disponible";
  return `${cita.paciente.usuario.nombre} ${cita.paciente.usuario.apellido}`;
}

function nombreDoctor(cita: Cita) {
  if (!cita.doctor?.usuario) return "Doctor no disponible";
  return `${cita.doctor.usuario.nombre} ${cita.doctor.usuario.apellido}`;
}

function nombreUsuario(log: LogAcceso) {
  if (!log.usuario) return "Usuario no disponible";
  return `${log.usuario.nombre} ${log.usuario.apellido}`;
}

function formatearFechaHora(fecha: string) {
  const date = new Date(fecha);

  if (Number.isNaN(date.getTime())) {
    return fecha;
  }

  return date.toLocaleString();
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [totalPacientes, setTotalPacientes] = useState(0);
  const [totalDoctores, setTotalDoctores] = useState(0);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [logs, setLogs] = useState<LogAcceso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cerrandoSesion, setCerrandoSesion] = useState(false);
  const [error, setError] = useState("");
  const [errorLogout, setErrorLogout] = useState("");

  async function cargarDashboard() {
    try {
      setCargando(true);
      setError("");

      const [usuarios, pacientes, doctores, datosCitas, datosLogs] =
        await Promise.all([
          usuarioService.obtenerTodos(),
          pacienteService.obtenerTodos(),
          doctorService.obtenerTodos(),
          citaService.obtenerTodos(),
          logAccesoService.obtenerTodos(),
        ]);

      setTotalUsuarios(usuarios.length);
      setTotalPacientes(pacientes.length);
      setTotalDoctores(doctores.length);
      setCitas(datosCitas);
      setLogs(datosLogs);
    } catch (error) {
      console.error(error);
      setError(
        obtenerMensajeError(
          error,
          "No fue posible cargar la informacion del dashboard.",
        ),
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {cargarDashboard()}, []);

  async function handleLogout() {
    try {
      setCerrandoSesion(true);
      setErrorLogout("");
      await authService.logout();
      cerrarSesion();
      navigate("/login");
    } catch (error) {
      console.error(error);
      setErrorLogout(
        obtenerMensajeError(error, "No fue posible cerrar sesion."),
      );
    } finally {
      setCerrandoSesion(false);
    }
  }

  const resumen = [
    {
      nombre: "Total Usuarios",
      cantidad: totalUsuarios,
      icono: <FaUsers />,
    },
    {
      nombre: "Total Pacientes",
      cantidad: totalPacientes,
      icono: <FaUserInjured />,
    },
    {
      nombre: "Total Doctores",
      cantidad: totalDoctores,
      icono: <FaUserMd />,
    },
    {
      nombre: "Total Citas",
      cantidad: citas.length,
      icono: <FaCalendarCheck />,
    },
    {
      nombre: "Citas Programadas",
      cantidad: citas.filter((cita) => cita.estado === "PROGRAMADA").length,
      icono: <FaClock />,
    },
    {
      nombre: "Citas Atendidas",
      cantidad: citas.filter((cita) => cita.estado === "ATENDIDA").length,
      icono: <FaCheckCircle />,
    },
  ];

  const citasPorEstado = useMemo(
    () =>
      ESTADOS_CITA.map((estado) => ({
        estado,
        cantidad: citas.filter((cita) => cita.estado === estado).length,
      })),
    [citas],
  );

  const proximasCitas = useMemo(() => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  return [...citas]
    .filter((cita) => {
      const fechaCita = new Date(
        `${cita.fecha}T${normalizarHora(cita.hora)}`
      );

      return (
        fechaCita >= hoy &&
        ["PROGRAMADA", "CONFIRMADA"].includes(cita.estado)
      );
    })
    .sort((a, b) =>
      `${a.fecha} ${normalizarHora(a.hora)}`.localeCompare(
        `${b.fecha} ${normalizarHora(b.hora)}`,
      ),
    )
    .slice(0, 5);
    }, [citas]
  );

  const ultimosAccesos = logs.slice(0, 5);

  return (
    <LayoutPortal>
      <div className="space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              Dashboard Administrativo
            </h1>
            <p className="text-slate-500 mt-2">
              Resumen general del sistema de gestion medica.
            </p>
            {errorLogout && (
              <p className="text-red-500 text-sm mt-2">{errorLogout}</p>
            )}
          </div>

          <button
            onClick={handleLogout}
            disabled={cerrandoSesion}
            className="bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2"
          >
            <FaSignOutAlt />
            {cerrandoSesion ? "Cerrando..." : "Cerrar Sesion"}
          </button>
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
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-6">
              {resumen.map((item) => (
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
                Citas por Estado
              </h2>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={citasPorEstado}
                    margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="estado" tick={{ fill: "#475569", fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fill: "#475569", fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="cantidad"name="Cantidad"fill="#06b6d4"radius={[8, 8, 0, 0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">
                  Proximas Citas
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3">Paciente</th>
                        <th className="text-left py-3">Doctor</th>
                        <th className="text-left py-3">Fecha</th>
                        <th className="text-left py-3">Hora</th>
                        <th className="text-left py-3">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proximasCitas.map((cita) => (
                        <tr key={cita.id_cita} className="border-b">
                          <td className="py-3">{nombrePaciente(cita)}</td>
                          <td>{nombreDoctor(cita)}</td>
                          <td>{cita.fecha}</td>
                          <td>{normalizarHora(cita.hora)}</td>
                          <td>{cita.estado}</td>
                        </tr>
                      ))}

                      {proximasCitas.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-500">
                            No hay proximas citas.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">
                  Ultimos Accesos
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3">Usuario</th>
                        <th className="text-left py-3">Evento</th>
                        <th className="text-left py-3">Fecha/Hora</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ultimosAccesos.map((log) => (
                        <tr key={log.id_log} className="border-b">
                          <td className="py-3">{nombreUsuario(log)}</td>
                          <td>{log.evento}</td>
                          <td>{formatearFechaHora(log.fecha_hora)}</td>
                        </tr>
                      ))}

                      {ultimosAccesos.length === 0 && (
                        <tr>
                          <td
                            colSpan={3}
                            className="py-6 text-center text-slate-500"
                          >
                            No hay accesos registrados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </LayoutPortal>
  );
}
