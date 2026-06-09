import { useEffect, useMemo, useState } from "react";
import LayoutPortal from "../../componentes/estructura/LayoutPortal";
import { authService } from "../../servicios/auth.service";
import {
  citaService,
  type CrearCitaDto,
  type Cita,
  type EstadoCita,
} from "../../servicios/cita.service";
import { doctorService, type Doctor } from "../../servicios/doctor.service";
import {
  pacienteService,
  type Paciente,
} from "../../servicios/paciente.service";
import { obtenerMensajeError } from "../../utilidades/apiErrores";
import { descargarComprobanteCita } from "../../utilidades/pdfCita";

const ESTADOS: (EstadoCita | "")[] = [
  "",
  "PROGRAMADA",
  "CONFIRMADA",
  "ATENDIDA",
  "CANCELADA",
];

const FORMULARIO_VACIO = {
  id_doctor: 0,
  fecha: "",
  hora: "",
  observaciones: "",
};

const ERRORES_VACIOS = {
  id_doctor: "",
  fecha: "",
  hora: "",
  observaciones: "",
};

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

function nombreDoctorObj(doctor?: Doctor) {
  if (!doctor?.usuario) return "Sin doctor";
  return `${doctor.usuario.nombre} ${doctor.usuario.apellido}`;
}

function validarFormulario(formulario: typeof FORMULARIO_VACIO) {
  const errores = { ...ERRORES_VACIOS };

  if (!formulario.id_doctor) errores.id_doctor = "Seleccione un doctor.";
  if (!formulario.fecha) errores.fecha = "Seleccione una fecha.";
  if (!formulario.hora) errores.hora = "Seleccione una hora disponible.";
  if (formulario.observaciones.trim().length > 200) {
    errores.observaciones = "Máximo 200 caracteres.";
  }

  const esValido = Object.values(errores).every((e) => e === "");
  return { errores, esValido };
}

export default function MisCitasPaciente() {
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState<EstadoCita | "">("");
  const [fecha, setFecha] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Modal agendar cita
  const [mostrarModal, setMostrarModal] = useState(false);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [errores, setErrores] = useState(ERRORES_VACIOS);
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([]);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);
  const [guardando, setGuardando] = useState(false);

  async function cargarCitas(pacienteId?: number) {
    const id = pacienteId ?? paciente?.id_paciente;
    if (!id) return;
    const data = await citaService.obtenerTodos({ paciente: id });
    setCitas(data);
  }

  async function cargarDatosIniciales() {
    try {
      setCargando(true);
      const [perfil, pacientes, datosDoctores] = await Promise.all([
        authService.obtenerPerfil() as Promise<PerfilAuth>,
        pacienteService.obtenerTodos(),
        doctorService.obtenerTodos(),
      ]);

      const pacienteActual = pacientes.find(
        (item) => item.usuario.id_usuario === perfil.sub,
      );

      if (!pacienteActual) {
        setError("No se encontró un paciente asociado al usuario autenticado.");
        return;
      }

      setPaciente(pacienteActual);
      setDoctores(datosDoctores);
      const data = await citaService.obtenerTodos({
        paciente: pacienteActual.id_paciente,
      });
      setCitas(data);
    } catch (err) {
      console.error(err);
      setError(obtenerMensajeError(err, "No fue posible cargar tus citas."));
    } finally {
      setCargando(false);
    }
  }

  async function cargarHorariosDisponibles(
    idDoctor: number,
    fechaSeleccionada: string,
  ) {
    if (!idDoctor || !fechaSeleccionada) {
      setHorariosDisponibles([]);
      return;
    }
    try {
      setCargandoHorarios(true);
      const data = await citaService.obtenerHorariosDisponibles(
        idDoctor,
        fechaSeleccionada,
      );
      const horarios = data.horarios_disponibles.map((h: string) =>
        h.substring(0, 5),
      );
      setHorariosDisponibles([...new Set(horarios)].sort());
    } catch (err) {
      console.error(err);
      setHorariosDisponibles([]);
      alert(
        obtenerMensajeError(
          err,
          "No fue posible cargar los horarios disponibles.",
        ),
      );
    } finally {
      setCargandoHorarios(false);
    }
  }

  function actualizarCampo(
    campo: keyof typeof FORMULARIO_VACIO,
    valor: string | number,
  ) {
    const actualizado = { ...formulario, [campo]: valor };

    if (campo === "id_doctor" || campo === "fecha") {
      actualizado.hora = "";
      cargarHorariosDisponibles(
        campo === "id_doctor" ? Number(valor) : actualizado.id_doctor,
        campo === "fecha" ? String(valor) : actualizado.fecha,
      );
    }

    setFormulario(actualizado);

    if (errores[campo]) {
      const { errores: nuevosErrores } = validarFormulario(actualizado);
      setErrores((prev) => ({ ...prev, [campo]: nuevosErrores[campo] }));
    }
  }

  function abrirModal() {
    setFormulario(FORMULARIO_VACIO);
    setErrores(ERRORES_VACIOS);
    setHorariosDisponibles([]);
    setMostrarModal(true);
  }

  function cerrarModal() {
    setMostrarModal(false);
    setFormulario(FORMULARIO_VACIO);
    setErrores(ERRORES_VACIOS);
    setHorariosDisponibles([]);
  }

  async function agendarCita() {
    const { errores: nuevosErrores, esValido } = validarFormulario(formulario);
    setErrores(nuevosErrores);
    if (!esValido || !paciente) return;

    try {
      setGuardando(true);
      const datos: CrearCitaDto = {
        id_paciente: paciente.id_paciente,
        id_doctor: formulario.id_doctor,
        fecha: formulario.fecha,
        hora: formulario.hora,
        observaciones: formulario.observaciones.trim(),
      };
      await citaService.crear(datos);
      cerrarModal();
      await cargarCitas(paciente.id_paciente);
    } catch (err) {
      console.error(err);
      alert(obtenerMensajeError(err, "No fue posible agendar la cita."));
    } finally {
      setGuardando(false);
    }
  }

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const citasFiltradas = useMemo(
    () =>
      citas.filter((cita) => {
        const coincideBusqueda = `${nombreDoctor(cita)} ${cita.fecha} ${
          cita.hora
        } ${cita.estado} ${cita.observaciones ?? ""}`
          .toLowerCase()
          .includes(busqueda.toLowerCase());
        return (
          coincideBusqueda &&
          (!estado || cita.estado === estado) &&
          (!fecha || cita.fecha === fecha)
        );
      }),
    [busqueda, citas, estado, fecha],
  );

  return (
    <LayoutPortal>
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-cyan-600">Mis Citas</h1>
            {paciente && (
              <p className="text-slate-500 mt-1">
                {paciente.usuario.nombre} {paciente.usuario.apellido}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Buscar cita..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="border border-slate-300 rounded-xl px-4 py-3 w-72 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
              onClick={abrirModal}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-3 rounded-xl font-semibold whitespace-nowrap"
            >
              Agendar Cita
            </button>
          </div>
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
                  <th className="text-left py-3">Doctor</th>
                  <th className="text-left py-3">Especialidad</th>
                  <th className="text-left py-3">Fecha</th>
                  <th className="text-left py-3">Hora</th>
                  <th className="text-left py-3">Estado</th>
                  <th className="text-left py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {citasFiltradas.map((cita) => (
                  <tr key={cita.id_cita} className="border-b">
                    <td className="py-3">{nombreDoctor(cita)}</td>
                    <td>
                      {cita.doctor?.especialidad?.nombre ?? "No disponible"}
                    </td>
                    <td>{cita.fecha}</td>
                    <td>{normalizarHora(cita.hora)}</td>
                    <td>{cita.estado}</td>
                    <td>
                      <button
                        onClick={() => descargarComprobanteCita(cita)}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-xl text-sm font-medium"
                      >
                        Descargar PDF
                      </button>
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

      {/* Modal Agendar Cita */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-xl">
            <h2 className="text-2xl font-bold mb-6">Agendar Cita</h2>

            <div className="space-y-4">
              {/* Doctor */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Doctor
                </label>
                <select
                  value={formulario.id_doctor}
                  onChange={(e) =>
                    actualizarCampo("id_doctor", Number(e.target.value))
                  }
                  className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    errores.id_doctor
                      ? "border-red-400 bg-red-50"
                      : "border-slate-300"
                  }`}
                >
                  <option value={0}>Seleccione un doctor</option>
                  {doctores.map((doctor) => (
                    <option key={doctor.id_doctor} value={doctor.id_doctor}>
                      {nombreDoctorObj(doctor)} —{" "}
                      {doctor.especialidad?.nombre ?? "Sin especialidad"}
                    </option>
                  ))}
                </select>
                {errores.id_doctor && (
                  <p className="text-red-500 text-xs mt-1">
                    {errores.id_doctor}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fecha */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={formulario.fecha}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => actualizarCampo("fecha", e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                      errores.fecha
                        ? "border-red-400 bg-red-50"
                        : "border-slate-300"
                    }`}
                  />
                  {errores.fecha && (
                    <p className="text-red-500 text-xs mt-1">{errores.fecha}</p>
                  )}
                </div>

                {/* Hora */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Hora
                  </label>
                  <select
                    value={formulario.hora}
                    disabled={
                      !formulario.id_doctor ||
                      !formulario.fecha ||
                      cargandoHorarios
                    }
                    onChange={(e) => actualizarCampo("hora", e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                      errores.hora
                        ? "border-red-400 bg-red-50"
                        : "border-slate-300"
                    }`}
                  >
                    <option value="">
                      {cargandoHorarios
                        ? "Cargando horarios..."
                        : "Seleccione una hora"}
                    </option>
                    {horariosDisponibles.map((hora) => (
                      <option key={hora} value={hora}>
                        {hora}
                      </option>
                    ))}
                  </select>
                  {errores.hora && (
                    <p className="text-red-500 text-xs mt-1">{errores.hora}</p>
                  )}
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Observaciones{" "}
                  <span className="text-slate-400 font-normal">(opcional)</span>
                </label>
                <textarea
                  value={formulario.observaciones}
                  placeholder="Ingrese observaciones opcionales"
                  maxLength={200}
                  rows={3}
                  onChange={(e) =>
                    actualizarCampo("observaciones", e.target.value)
                  }
                  className={`w-full rounded-xl border px-4 py-3 outline-none bg-white resize-none transition ${
                    errores.observaciones
                      ? "border-red-500 focus:border-red-500"
                      : "border-slate-300 focus:border-cyan-500"
                  }`}
                />
                <div className="flex justify-between items-center mt-1">
                  {errores.observaciones ? (
                    <p className="text-red-500 text-xs">
                      {errores.observaciones}
                    </p>
                  ) : (
                    <span />
                  )}
                  <span className="text-xs text-slate-400">
                    {formulario.observaciones.length}/200
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={cerrarModal}
                className="bg-slate-200 hover:bg-slate-300 px-5 py-3 rounded-xl font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={agendarCita}
                disabled={guardando}
                className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-60 text-white px-5 py-3 rounded-xl font-semibold"
              >
                {guardando ? "Guardando..." : "Agendar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </LayoutPortal>
  );
}
