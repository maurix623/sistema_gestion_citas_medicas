import { useEffect, useMemo, useState } from "react";
import LayoutPortal from "../../componentes/estructura/LayoutPortal";
import { authService } from "../../servicios/auth.service";
import {
  citaService,
  type Cita,
  type EstadoCita,
} from "../../servicios/cita.service";
import { doctorService } from "../../servicios/doctor.service";
import { obtenerMensajeError } from "../../utilidades/apiErrores";

const ESTADOS: (EstadoCita | "")[] = [
  "",
  "PROGRAMADA",
  "CONFIRMADA",
  "ATENDIDA",
  "CANCELADA",
];

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

export default function MisCitasDoctor() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState<EstadoCita | "">("");
  const [fecha, setFecha] = useState("");
  const [error, setError] = useState("");

  async function cargarCitas() {
    try {
      setCargando(true);
      const [perfil, doctores] = await Promise.all([
        authService.obtenerPerfil() as Promise<PerfilAuth>,
        doctorService.obtenerTodos(),
      ]);
      const doctorActual = doctores.find(
        (doctor) => doctor.usuario.id_usuario === perfil.sub,
      );

      if (!doctorActual) {
        setError("No se encontro un doctor asociado al usuario autenticado.");
        return;
      }

      const data = await citaService.obtenerTodos({
        doctor: doctorActual.id_doctor,
      });
      setCitas(data);
    } catch (error) {
      console.error(error);
      setError(obtenerMensajeError(error, "No fue posible cargar las citas."));
    } finally {
      setCargando(false);
    }
  }

  async function cambiarEstado(idCita: number, nuevoEstado: EstadoCita) {
    try {
      await citaService.actualizar(idCita, {
        estado: nuevoEstado,
      });

      await cargarCitas();
    } catch (error) {
      console.error(error);

      alert(
        obtenerMensajeError(
          error,
          "No fue posible actualizar el estado de la cita.",
        ),
      );
    }
  }

  useEffect(() => {
    cargarCitas();
  }, []);

  const citasFiltradas = useMemo(
    () =>
      citas.filter((cita) => {
        const coincideBusqueda = `${nombrePaciente(cita)} ${cita.fecha} ${
          cita.hora
        } ${cita.estado} ${cita.observaciones ?? ""}`
          .toLowerCase()
          .includes(busqueda.toLowerCase());
        const coincideEstado = !estado || cita.estado === estado;
        const coincideFecha = !fecha || cita.fecha === fecha;
        return coincideBusqueda && coincideEstado && coincideFecha;
      }),
    [busqueda, citas, estado, fecha],
  );

  return (
    <LayoutPortal>
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-cyan-600">Mis Citas</h1>
          <input
            type="text"
            placeholder="Buscar cita..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="border border-slate-300 rounded-xl px-4 py-3 w-80 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value as EstadoCita | "")}
            className="border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            {ESTADOS.map((item) => (
              <option key={item || "TODOS"} value={item}>
                {item || "Todos los estados"}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <button
            onClick={() => {
              setEstado("");
              setFecha("");
            }}
            className="bg-slate-200 hover:bg-slate-300 px-5 py-3 rounded-xl font-medium"
          >
            Limpiar
          </button>
        </div>

        {cargando ? (
          <p>Cargando citas...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Paciente</th>
                  <th className="text-left py-3">Fecha</th>
                  <th className="text-left py-3">Hora</th>
                  <th className="text-left py-3">Estado</th>
                  <th className="text-left py-3">Observaciones</th>
                  <th className="text-left py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {citasFiltradas.map((cita) => (
                  <tr key={cita.id_cita} className="border-b">
                    <td className="py-3">{nombrePaciente(cita)}</td>
                    <td>{cita.fecha}</td>
                    <td>{normalizarHora(cita.hora)}</td>
                    <td>{cita.estado}</td>
                    <td>{cita.observaciones || "Sin observaciones"}</td>
                    <td>
                      <div className="flex gap-2">
                        {cita.estado === "PROGRAMADA" && (
                          <>
                            <button
                              onClick={() =>
                                cambiarEstado(cita.id_cita, "CONFIRMADA")
                              }
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm"
                            >
                              Confirmar
                            </button>

                            <button
                              onClick={() =>
                                cambiarEstado(cita.id_cita, "CANCELADA")
                              }
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
                            >
                              Cancelar
                            </button>
                          </>
                        )}

                        {cita.estado === "CONFIRMADA" && (
                          <>
                            <button
                              onClick={() =>
                                cambiarEstado(cita.id_cita, "ATENDIDA")
                              }
                              className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-1 rounded-lg text-sm"
                            >
                              Atender
                            </button>

                            <button
                              onClick={() =>
                                cambiarEstado(cita.id_cita, "CANCELADA")
                              }
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
                            >
                              Cancelar
                            </button>
                          </>
                        )}

                        {(cita.estado === "ATENDIDA" ||
                          cita.estado === "CANCELADA") && (
                          <span className="text-slate-400 text-sm">
                            Sin acciones
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {citasFiltradas.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500">
                      No se encontraron citas.
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
