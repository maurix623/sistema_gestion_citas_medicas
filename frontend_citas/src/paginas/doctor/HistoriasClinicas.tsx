import { useEffect, useMemo, useState } from "react";
import LayoutPortal from "../../componentes/estructura/LayoutPortal";
import { authService } from "../../servicios/auth.service";
import { citaService, type Cita } from "../../servicios/cita.service";
import { doctorService } from "../../servicios/doctor.service";
import {
  historiaClinicaService,
  type CrearHistoriaClinicaDto,
  type HistoriaClinica,
} from "../../servicios/historiaClinica.service";
import { signoVitalService, type SignoVital } from "../../servicios/signoVital.service";
import { obtenerMensajeError } from "../../utilidades/apiErrores";

interface PerfilAuth {
  sub: number;
  correo: string;
  rol: string;
}

const FORMULARIO_VACIO = {
  id_cita: 0,
  diagnostico: "",
  tratamiento: "",
  notas_medicas: "",
};

function normalizarHora(hora: string) {
  return hora.substring(0, 5);
}

function nombrePaciente(cita?: Cita) {
  if (!cita?.paciente?.usuario) return "Paciente no disponible";
  return `${cita.paciente.usuario.nombre} ${cita.paciente.usuario.apellido}`;
}

export default function HistoriasClinicasDoctor() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [signos, setSignos] = useState<SignoVital[]>([]);
  const [historias, setHistorias] = useState<HistoriaClinica[]>([]);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  async function cargarDatos() {
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

      const [citasDoctor, signosTodos, historiasTodas] = await Promise.all([
        citaService.obtenerTodos({ doctor: doctorActual.id_doctor }),
        signoVitalService.obtenerTodos(),
        historiaClinicaService.obtenerTodos(),
      ]);
      setCitas(citasDoctor);
      setSignos(
        signosTodos.filter((signo) =>
          citasDoctor.some((cita) => cita.id_cita === signo.cita.id_cita),
        ),
      );
      setHistorias(
        historiasTodas.filter((historia) =>
          citasDoctor.some((cita) => cita.id_cita === historia.cita.id_cita),
        ),
      );
    } catch (error) {
      console.error(error);
      setError(
        obtenerMensajeError(error, "No fue posible cargar historias clinicas."),
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  const citasDisponibles = citas.filter((cita) => {
    const atendida = cita.estado === "ATENDIDA";
    const tieneSignos = signos.some((signo) => signo.cita.id_cita === cita.id_cita);
    const tieneHistoria = historias.some(
      (historia) => historia.cita.id_cita === cita.id_cita,
    );
    return atendida && tieneSignos && !tieneHistoria;
  });

  const historiasFiltradas = useMemo(
    () =>
      historias.filter((historia) => {
        const cita = citas.find((item) => item.id_cita === historia.cita.id_cita);
        return `${nombrePaciente(cita)} ${cita?.fecha ?? ""} ${historia.diagnostico} ${
          historia.tratamiento ?? ""
        }`
          .toLowerCase()
          .includes(busqueda.toLowerCase());
      }),
    [busqueda, citas, historias],
  );

  function actualizarCampo(campo: keyof typeof FORMULARIO_VACIO, valor: string) {
    setFormulario((prev) => ({ ...prev, [campo]: valor }));
  }

  async function guardarHistoria() {
    if (!formulario.id_cita) {
      alert("Seleccione una cita atendida con signos vitales.");
      return;
    }

    if (!formulario.diagnostico.trim()) {
      alert("El diagnostico es obligatorio.");
      return;
    }

    try {
      setGuardando(true);
      const datos: CrearHistoriaClinicaDto = {
        id_cita: Number(formulario.id_cita),
        diagnostico: formulario.diagnostico.trim(),
        tratamiento: formulario.tratamiento.trim() || undefined,
        notas_medicas: formulario.notas_medicas.trim() || undefined,
      };
      await historiaClinicaService.crear(datos);
      setFormulario(FORMULARIO_VACIO);
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert(
        obtenerMensajeError(error, "No fue posible registrar historia clinica."),
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <LayoutPortal>
      <div className="space-y-8">
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6 gap-4">
            <h1 className="text-3xl font-bold text-cyan-600">
              Historias Clinicas
            </h1>
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
                    <th className="text-left py-3">Paciente</th>
                    <th className="text-left py-3">Fecha</th>
                    <th className="text-left py-3">Diagnostico</th>
                    <th className="text-left py-3">Tratamiento</th>
                  </tr>
                </thead>
                <tbody>
                  {historiasFiltradas.map((historia) => {
                    const cita = citas.find((item) => item.id_cita === historia.cita.id_cita);
                    return (
                      <tr key={historia.id_historia} className="border-b">
                        <td className="py-3">{nombrePaciente(cita)}</td>
                        <td>{cita ? `${cita.fecha} ${normalizarHora(cita.hora)}` : "No disponible"}</td>
                        <td>{historia.diagnostico}</td>
                        <td>{historia.tratamiento || "No registrado"}</td>
                      </tr>
                    );
                  })}
                  {historiasFiltradas.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-500">
                        No se encontraron historias clinicas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Nueva Historia Clinica</h2>
          <div className="space-y-4">
            <select
              value={formulario.id_cita}
              onChange={(e) => actualizarCampo("id_cita", e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value={0}>Seleccione una cita atendida con signos vitales</option>
              {citasDisponibles.map((cita) => (
                <option key={cita.id_cita} value={cita.id_cita}>
                  {cita.fecha} {normalizarHora(cita.hora)} - {nombrePaciente(cita)}
                </option>
              ))}
            </select>

            <textarea
              value={formulario.diagnostico}
              maxLength={200}
              placeholder="Diagnostico"
              rows={4}
              onChange={(e) => actualizarCampo("diagnostico", e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
            />
            <textarea
              value={formulario.tratamiento}
              maxLength={200}
              placeholder="Tratamiento"
              rows={3}
              onChange={(e) => actualizarCampo("tratamiento", e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
            />
            <textarea
              value={formulario.notas_medicas}
              maxLength={200}
              placeholder="Notas medicas"
              rows={3}
              onChange={(e) => actualizarCampo("notas_medicas", e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
            />

            <div className="flex justify-end">
              <button
                onClick={guardarHistoria}
                disabled={guardando}
                className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-60 text-white px-5 py-3 rounded-xl font-semibold"
              >
                {guardando ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </LayoutPortal>
  );
}
