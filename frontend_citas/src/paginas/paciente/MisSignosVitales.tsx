import { useEffect, useMemo, useState } from "react";
import LayoutPortal from "../../componentes/estructura/LayoutPortal";
import { authService } from "../../servicios/auth.service";
import { citaService, type Cita } from "../../servicios/cita.service";
import { pacienteService, type Paciente } from "../../servicios/paciente.service";
import { signoVitalService, type SignoVital } from "../../servicios/signoVital.service";
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

export default function MisSignosVitalesPaciente() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [signos, setSignos] = useState<SignoVital[]>([]);
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [busqueda, setBusqueda] = useState("");
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
      const [citasPaciente, signosTodos] = await Promise.all([
        citaService.obtenerTodos({ paciente: pacienteActual.id_paciente }),
        signoVitalService.obtenerTodos(),
      ]);
      setCitas(citasPaciente);
      setSignos(
        signosTodos.filter((signo) =>
          citasPaciente.some((cita) => cita.id_cita === signo.cita.id_cita),
        ),
      );
    } catch (error) {
      console.error(error);
      setError(
        obtenerMensajeError(error, "No fue posible cargar signos vitales."),
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  const signosFiltrados = useMemo(
    () =>
      signos.filter((signo) => {
        const cita = citas.find((item) => item.id_cita === signo.cita.id_cita);
        return `${cita?.fecha ?? ""} ${normalizarHora(cita?.hora)} ${nombreDoctor(
          cita,
        )} ${signo.presion_arterial ?? ""} ${signo.peso ?? ""}`
          .toLowerCase()
          .includes(busqueda.toLowerCase());
      }),
    [busqueda, citas, signos],
  );

  return (
    <LayoutPortal>
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-cyan-600">
              Mis Signos Vitales
            </h1>
            {paciente && (
              <p className="text-slate-500 mt-1">
                {paciente.usuario.nombre} {paciente.usuario.apellido}
              </p>
            )}
          </div>
          <input
            type="text"
            placeholder="Buscar signos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="border border-slate-300 rounded-xl px-4 py-3 w-80 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {cargando ? (
          <p>Cargando signos vitales...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Fecha cita</th>
                  <th className="text-left py-3">Doctor</th>
                  <th className="text-left py-3">Peso</th>
                  <th className="text-left py-3">Temperatura</th>
                  <th className="text-left py-3">Presion</th>
                  <th className="text-left py-3">Saturacion</th>
                </tr>
              </thead>
              <tbody>
                {signosFiltrados.map((signo) => {
                  const cita = citas.find(
                    (item) => item.id_cita === signo.cita.id_cita,
                  );

                  return (
                    <tr key={signo.id_signo} className="border-b">
                      <td className="py-3">
                        {cita
                          ? `${cita.fecha} ${normalizarHora(cita.hora)}`
                          : "No disponible"}
                      </td>
                      <td>{nombreDoctor(cita)}</td>
                      <td>{signo.peso ?? "No registrado"}</td>
                      <td>{signo.temperatura ?? "No registrado"}</td>
                      <td>{signo.presion_arterial || "No registrado"}</td>
                      <td>{signo.saturacion_oxigeno ?? "No registrado"}</td>
                    </tr>
                  );
                })}

                {signosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500">
                      No se encontraron signos vitales.
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
