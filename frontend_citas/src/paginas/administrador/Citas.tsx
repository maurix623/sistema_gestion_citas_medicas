import { useEffect, useMemo, useState } from "react";
import LayoutPortal from "../../componentes/estructura/LayoutPortal";
import {citaService,type ActualizarCitaDto,type Cita,type CrearCitaDto,type EstadoCita,type FiltrosCita} from "../../servicios/cita.service";
import { doctorService, type Doctor } from "../../servicios/doctor.service";
import { pacienteService, type Paciente } from "../../servicios/paciente.service";
import { obtenerMensajeError } from "../../utilidades/apiErrores";

const ESTADOS_CITA: EstadoCita[] = ["PROGRAMADA","CONFIRMADA","ATENDIDA","CANCELADA"];

const CITA_VACIA = {
  id_paciente: 0,
  id_doctor: 0,
  fecha: "",
  hora: "",
  estado: "PROGRAMADA" as EstadoCita,
  observaciones: "",
};

const ERRORES_VACIOS = {
  id_paciente: "",
  id_doctor: "",
  fecha: "",
  hora: "",
  estado: "",
  observaciones: "",
};

const FILTROS_VACIOS = {
  fecha: "",
  estado: "" as EstadoCita | "",
  doctor: 0,
  paciente: 0,
};

function normalizarHora(hora: string) {
  return hora.substring(0, 5);
}

function nombrePaciente(paciente?: Paciente) {
  if (!paciente?.usuario) return "Sin paciente";
  return `${paciente.usuario.nombre} ${paciente.usuario.apellido}`;
}

function nombreDoctor(doctor?: Doctor) {
  if (!doctor?.usuario) return "Sin doctor";
  return `${doctor.usuario.nombre} ${doctor.usuario.apellido}`;
}

function validarCita(cita: typeof CITA_VACIA) {
  const errores = { ...ERRORES_VACIOS };

  if (!cita.id_paciente) errores.id_paciente = "Seleccione un paciente.";
  if (!cita.id_doctor) errores.id_doctor = "Seleccione un doctor.";
  if (!cita.fecha) errores.fecha = "Seleccione una fecha.";
  if (!cita.hora) errores.hora = "Seleccione una hora disponible.";
  if (!ESTADOS_CITA.includes(cita.estado)) {
    errores.estado = "Seleccione un estado valido.";
  }
  if (cita.observaciones.trim().length > 200) {
    errores.observaciones = "Maximo 200 caracteres.";
  }

  const esValido = Object.values(errores).every((error) => error === "");
  return { errores, esValido };
}

export default function Citas() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [citaEditando, setCitaEditando] = useState<Cita | null>(null);
  const [formulario, setFormulario] = useState(CITA_VACIA);
  const [errores, setErrores] = useState(ERRORES_VACIOS);

  async function cargarCitas(filtrosActuales: typeof FILTROS_VACIOS = filtros) {
    try {
      setCargando(true);
      const filtrosApi: FiltrosCita = {
        fecha: filtrosActuales.fecha || undefined,
        estado: filtrosActuales.estado || undefined,
        doctor: filtrosActuales.doctor || undefined,
        paciente: filtrosActuales.paciente || undefined,
      };
      const data = await citaService.obtenerTodos(filtrosApi);
      setCitas(data);
    } catch (error) {
      console.error(error);
      alert(obtenerMensajeError(error, "No fue posible cargar las citas."));
    } finally {
      setCargando(false);
    }
  }

  async function cargarDatosIniciales() {
    try {
      const [datosDoctores, datosPacientes] = await Promise.all([
        doctorService.obtenerTodos(),
        pacienteService.obtenerTodos(),
      ]);
      setDoctores(datosDoctores);
      setPacientes(datosPacientes);
      await cargarCitas(FILTROS_VACIOS);
    } catch (error) {
      console.error(error);
      alert(obtenerMensajeError(error, "No fue posible cargar los datos."));
      setCargando(false);
    }
  }

  async function cargarHorariosDisponibles(
    idDoctor: number,
    fecha: string,
    horaActual = "",
  ) {
    if (!idDoctor || !fecha) {
      setHorariosDisponibles([]);
      return;
    }

    try {
      setCargandoHorarios(true);
      const data = await citaService.obtenerHorariosDisponibles(idDoctor, fecha);
      const horarios = data.horarios_disponibles.map(normalizarHora);
      const horaNormalizada = horaActual ? normalizarHora(horaActual) : "";
      const conHoraActual =
        horaNormalizada && !horarios.includes(horaNormalizada)
          ? [...horarios, horaNormalizada]
          : horarios;

      setHorariosDisponibles([...new Set(conHoraActual)].sort());
    } catch (error) {
      console.error(error);
      setHorariosDisponibles([]);
      alert(
        obtenerMensajeError(
          error,
          "No fue posible cargar los horarios disponibles.",
        ),
      );
    } finally {
      setCargandoHorarios(false);
    }
  }

  function actualizarCampo(campo: keyof typeof CITA_VACIA, valor: string | number) {
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
      const { errores: nuevosErrores } = validarCita(actualizado);
      setErrores((prev) => ({ ...prev, [campo]: nuevosErrores[campo] }));
    }
  }

  function cerrarModal() {
    setMostrarModal(false);
    setModoEdicion(false);
    setCitaEditando(null);
    setFormulario(CITA_VACIA);
    setErrores(ERRORES_VACIOS);
    setHorariosDisponibles([]);
  }

  function abrirCrear() {
    setFormulario(CITA_VACIA);
    setHorariosDisponibles([]);
    setMostrarModal(true);
  }

  function abrirEditar(cita: Cita) {
    const datos = {
      id_paciente: cita.paciente.id_paciente,
      id_doctor: cita.doctor.id_doctor,
      fecha: cita.fecha,
      hora: normalizarHora(cita.hora),
      estado: cita.estado,
      observaciones: cita.observaciones ?? "",
    };

    setModoEdicion(true);
    setCitaEditando(cita);
    setFormulario(datos);
    setMostrarModal(true);
    cargarHorariosDisponibles(datos.id_doctor, datos.fecha, datos.hora);
  }

  async function guardarCita() {
    const { errores: nuevosErrores, esValido } = validarCita(formulario);
    setErrores(nuevosErrores);
    if (!esValido) return;

    try {
      setGuardando(true);

      if (modoEdicion && citaEditando) {
        const datosEdicion: ActualizarCitaDto = {
          fecha: formulario.fecha,
          hora: formulario.hora,
          estado: formulario.estado,
          observaciones: formulario.observaciones.trim(),
        };
        await citaService.actualizar(citaEditando.id_cita, datosEdicion);
      } else {
        const datosCreacion: CrearCitaDto = {
          id_paciente: formulario.id_paciente,
          id_doctor: formulario.id_doctor,
          fecha: formulario.fecha,
          hora: formulario.hora,
          observaciones: formulario.observaciones.trim(),
        };
        await citaService.crear(datosCreacion);
      }

      cerrarModal();
      cargarCitas();
    } catch (error) {
      console.error(error);
      alert(
        obtenerMensajeError(
          error,
          modoEdicion
            ? "No fue posible actualizar la cita."
            : "No fue posible crear la cita.",
        ),
      );
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarCita(id: number) {
    if (!window.confirm("Desea eliminar esta cita?")) return;

    try {
      await citaService.eliminar(id);
      cargarCitas();
    } catch (error) {
      console.error(error);
      alert(obtenerMensajeError(error, "No fue posible eliminar la cita."));
    }
  }

  function actualizarFiltro(
    campo: keyof typeof FILTROS_VACIOS,
    valor: string | number,
  ) {
    const filtrosActualizados = { ...filtros, [campo]: valor };
    setFiltros(filtrosActualizados);
    cargarCitas(filtrosActualizados);
  }

  function limpiarFiltros() {
    setFiltros(FILTROS_VACIOS);
    cargarCitas(FILTROS_VACIOS);
  }

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const citasFiltradas = useMemo(
    () =>
      citas.filter((cita) =>
        `${nombrePaciente(cita.paciente)} ${cita.paciente.usuario?.correo ?? ""} ${
          cita.paciente.usuario?.telefono ?? ""
        } ${nombreDoctor(cita.doctor)} ${cita.doctor.usuario?.correo ?? ""} ${
          cita.doctor.especialidad?.nombre ?? ""
        } ${cita.fecha} ${cita.hora} ${cita.estado} ${
          cita.observaciones ?? ""
        }`
          .toLowerCase()
          .includes(busqueda.toLowerCase()),
      ),
    [busqueda, citas],
  );

  return (
    <LayoutPortal>
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-cyan-600">
            Gestion de Citas
          </h1>

          <input type="text" placeholder="Buscar cita..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="border border-slate-300 rounded-xl px-4 py-3 w-80 focus:outline-none focus:ring-2 focus:ring-cyan-500"/>
          <button onClick={abrirCrear} className="bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-3 rounded-xl font-semibold">
            Nueva Cita
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
          <input type="date" value={filtros.fecha} onChange={(e) => actualizarFiltro("fecha", e.target.value)} className="border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"/>
          <select
            value={filtros.estado}
            onChange={(e) => actualizarFiltro("estado", e.target.value as EstadoCita | "")}
            className="border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">Todos los estados</option>
            {ESTADOS_CITA.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>

          <select value={filtros.doctor} onChange={(e) => actualizarFiltro("doctor", Number(e.target.value))} className="border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500">
            <option value={0}>Todos los doctores</option>
            {doctores.map((doctor) => (
              <option key={doctor.id_doctor} value={doctor.id_doctor}>
                {nombreDoctor(doctor)}
              </option>
            ))}
          </select>

          <select value={filtros.paciente} onChange={(e) => actualizarFiltro("paciente", Number(e.target.value))} className="border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500">
            <option value={0}>Todos los pacientes</option>
            {pacientes.map((paciente) => (
              <option key={paciente.id_paciente} value={paciente.id_paciente}>
                {nombrePaciente(paciente)}
              </option>
            ))}
          </select>

          <button
            onClick={limpiarFiltros}
            className="bg-slate-200 hover:bg-slate-300 px-5 py-3 rounded-xl font-medium"
          >
            Limpiar
          </button>
        </div>

        {cargando ? (
          <p>Cargando citas...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Fecha</th>
                  <th className="text-left py-3">Hora</th>
                  <th className="text-left py-3">Paciente</th>
                  <th className="text-left py-3">Doctor</th>
                  <th className="text-left py-3">Estado</th>
                  <th className="text-left py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {citasFiltradas.map((cita) => (
                  <tr key={cita.id_cita} className="border-b">
                    <td className="py-3">{cita.fecha}</td>
                    <td>{normalizarHora(cita.hora)}</td>
                    <td>{nombrePaciente(cita.paciente)}</td>
                    <td>{nombreDoctor(cita.doctor)}</td>
                    <td>{cita.estado}</td>
                    <td className="space-x-2 py-3">
                      <button onClick={() => abrirEditar(cita)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg">
                        Editar
                      </button>
                      <button onClick={() => eliminarCita(cita.id_cita)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg">
                        Eliminar
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

      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">
              {modoEdicion ? "Editar Cita" : "Nueva Cita"}
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Paciente
                  </label>
                  <select value={formulario.id_paciente} disabled={modoEdicion} onChange={(e) => actualizarCampo("id_paciente", Number(e.target.value)) }
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                      errores.id_paciente
                        ? "border-red-400 bg-red-50"
                        : "border-slate-300"
                    } ${modoEdicion ? "bg-slate-100" : "bg-white"}`}
                  >
                    <option value={0}>Seleccione un paciente</option>
                    {pacientes.map((paciente) => (
                      <option
                        key={paciente.id_paciente}
                        value={paciente.id_paciente}
                      >
                        {nombrePaciente(paciente)}
                      </option>
                    ))}
                  </select>
                  {errores.id_paciente && (
                    <p className="text-red-500 text-xs mt-1">
                      {errores.id_paciente}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Doctor
                  </label>
                  <select value={formulario.id_doctor} disabled={modoEdicion} onChange={(e) =>   actualizarCampo("id_doctor", Number(e.target.value)) }
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                      errores.id_doctor
                        ? "border-red-400 bg-red-50"
                        : "border-slate-300"
                    } ${modoEdicion ? "bg-slate-100" : "bg-white"}`}
                  >
                    <option value={0}>Seleccione un doctor</option>
                    {doctores.map((doctor) => (
                      <option key={doctor.id_doctor} value={doctor.id_doctor}>
                        {nombreDoctor(doctor)} -{" "}
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Fecha
                  </label>
                  <input type="date" value={formulario.fecha} min={new Date().toISOString().slice(0, 10)} onChange={(e) => actualizarCampo("fecha", e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                      errores.fecha
                        ? "border-red-400 bg-red-50"
                        : "border-slate-300"
                    }`}
                  />
                  {errores.fecha && (
                    <p className="text-red-500 text-xs mt-1">
                      {errores.fecha}
                    </p>
                  )}
                </div>

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

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Estado
                  </label>
                  <select value={formulario.estado} onChange={(e) =>   actualizarCampo("estado", e.target.value as EstadoCita) }
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {ESTADOS_CITA.map((estado) => (
                      <option key={estado} value={estado}>
                        {estado}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Observaciones
                </label>
                <textarea value={formulario.observaciones} placeholder="Ingrese observaciones opcionales" maxLength={200} onChange={(e) => actualizarCampo("observaciones", e.target.value) }
                  rows={4}
                  className={`w-full rounded-xl border px-4 py-3 transition outline-none bg-white resize-none ${
                    errores.observaciones
                      ? "border-red-500 focus:border-red-500"
                      : "border-slate-300 focus:border-cyan-500"
                  }`}
                />
                {errores.observaciones && (
                  <p className="text-sm text-red-500">
                    {errores.observaciones}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={cerrarModal}
                className="bg-slate-200 hover:bg-slate-300 px-5 py-3 rounded-xl font-medium"
              >
                Cancelar
              </button>
              <button onClick={guardarCita} disabled={guardando} className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-60 text-white px-5 py-3 rounded-xl font-semibold"
              >
                {guardando
                  ? "Guardando..."
                  : modoEdicion
                    ? "Actualizar"
                    : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </LayoutPortal>
  );
}
