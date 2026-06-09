import { useEffect, useState } from "react";
import LayoutPortal from "../../componentes/estructura/LayoutPortal";
import {doctorService,type Doctor,} from "../../servicios/doctor.service";
import {horarioAtencionService,type ActualizarHorarioAtencionDto,type CrearHorarioAtencionDto,type DiaSemana,type HorarioAtencion,} from "../../servicios/horarioAtencion.service";

const DIAS_SEMANA: DiaSemana[] = ["LUNES","MARTES","MIERCOLES","JUEVES","VIERNES","SABADO","DOMINGO",];

const HORARIO_VACIO = {
  id_doctor: 0,
  dia_semana: "LUNES" as DiaSemana,
  hora_inicio: "",
  hora_fin: "",
  duracion_cita_minutos: 30,
};

const ERRORES_VACIOS = {
  id_doctor: "",
  dia_semana: "",
  hora_inicio: "",
  hora_fin: "",
  duracion_cita_minutos: "",
};

function normalizarHora(hora: string) {
  return hora.substring(0, 5);
}

function nombreDoctor(doctor?: Doctor) {
  if (!doctor?.usuario) return doctor?.matricula ?? "Sin doctor";
  return `${doctor.usuario.nombre} ${doctor.usuario.apellido}`;
}

function validarHorario(horario: typeof HORARIO_VACIO) {
  const errores = { ...ERRORES_VACIOS };
  const regexHora = /^([01]\d|2[0-3]):([0-5]\d)$/;

  if (!horario.id_doctor) errores.id_doctor = "Seleccione un doctor.";
  if (!DIAS_SEMANA.includes(horario.dia_semana)) {
    errores.dia_semana = "Seleccione un dia valido.";
  }

  if (!horario.hora_inicio) errores.hora_inicio = "La hora inicio es obligatoria.";
  else if (!regexHora.test(horario.hora_inicio)) {
    errores.hora_inicio = "Formato requerido HH:mm.";
  }

  if (!horario.hora_fin) errores.hora_fin = "La hora fin es obligatoria.";
  else if (!regexHora.test(horario.hora_fin)) {
    errores.hora_fin = "Formato requerido HH:mm.";
  }

  if ( horario.hora_inicio && horario.hora_fin && horario.hora_inicio >= horario.hora_fin) {
    errores.hora_fin = "La hora fin debe ser mayor.";
  }

  if (horario.hora_inicio && horario.hora_inicio < "08:00") {
    errores.hora_inicio = "Debe ser desde las 08:00.";
  }

  if (horario.hora_fin && horario.hora_fin > "20:00") {
    errores.hora_fin = "Debe ser hasta las 20:00.";
  }

  if (!horario.duracion_cita_minutos) {
    errores.duracion_cita_minutos = "La duracion es obligatoria.";
  } 
  else if ( horario.duracion_cita_minutos < 10 || horario.duracion_cita_minutos > 120 ) {
    errores.duracion_cita_minutos = "Debe estar entre 10 y 120 minutos.";
  }

  const esValido = Object.values(errores).every((error) => error === "");
  return { errores, esValido };
}

export default function Horarios() {
  const [horarios, setHorarios] = useState<HorarioAtencion[]>([]);
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [horarioEditando, setHorarioEditando] =useState<HorarioAtencion | null>(null);
  const [formulario, setFormulario] = useState(HORARIO_VACIO);
  const [errores, setErrores] = useState(ERRORES_VACIOS);

  async function cargarDatos() {
    try {
      const [datosHorarios, datosDoctores] = await Promise.all([ horarioAtencionService.obtenerTodos(), doctorService.obtenerTodos() ]);
      setHorarios(datosHorarios);
      setDoctores(datosDoctores);
    } 
    catch (error) {
      console.error(error);
      alert("No fue posible cargar los horarios.");
    } 
    finally { setCargando(false); }
  }

  function actualizarCampo( campo: keyof typeof HORARIO_VACIO, valor: string | number ) {
    const actualizado = { ...formulario, [campo]: valor };
    setFormulario(actualizado);

    if (errores[campo]) {
      const { errores: nuevosErrores } = validarHorario(actualizado);
      setErrores((prev) => ({ ...prev, [campo]: nuevosErrores[campo] }));
    }
  }

  function cerrarModal() {
    setMostrarModal(false);
    setModoEdicion(false);
    setHorarioEditando(null);
    setFormulario(HORARIO_VACIO);
    setErrores(ERRORES_VACIOS);
  }

  function obtenerDoctorCompleto(idDoctor?: number) {
    return doctores.find((doctor) => doctor.id_doctor === idDoctor);
  }

  function abrirEditar(horario: HorarioAtencion) {
    setModoEdicion(true);
    setHorarioEditando(horario);
    setFormulario({
      id_doctor: horario.doctor.id_doctor,
      dia_semana: horario.dia_semana,
      hora_inicio: normalizarHora(horario.hora_inicio),
      hora_fin: normalizarHora(horario.hora_fin),
      duracion_cita_minutos: horario.duracion_cita_minutos,
    });
    setMostrarModal(true);
  }

  async function guardarHorario() {
    const { errores: nuevosErrores, esValido } = validarHorario(formulario);
    setErrores(nuevosErrores);
    if (!esValido) return;

    try {
      setGuardando(true);

      if (modoEdicion && horarioEditando) {
        const datosEdicion: ActualizarHorarioAtencionDto = {
          id_doctor: formulario.id_doctor,
          dia_semana: formulario.dia_semana,
          hora_inicio: formulario.hora_inicio,
          hora_fin: formulario.hora_fin,
          duracion_cita_minutos: formulario.duracion_cita_minutos,
        };
        await horarioAtencionService.actualizar(
          horarioEditando.id_horario,
          datosEdicion,
        );
      } else {
        const datosCreacion: CrearHorarioAtencionDto = {
          id_doctor: formulario.id_doctor,
          dia_semana: formulario.dia_semana,
          hora_inicio: formulario.hora_inicio,
          hora_fin: formulario.hora_fin,
          duracion_cita_minutos: formulario.duracion_cita_minutos,
        };
        await horarioAtencionService.crear(datosCreacion);
      }

      cerrarModal();
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert(
        modoEdicion
          ? "No fue posible actualizar el horario."
          : "No fue posible crear el horario.",
      );
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarHorario(id: number) {
    if (!window.confirm("Desea eliminar este horario?")) return;

    try {
      await horarioAtencionService.eliminar(id);
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert("No fue posible eliminar el horario.");
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  const horariosFiltrados = horarios.filter((horario) => {
    const doctorCompleto = obtenerDoctorCompleto(horario.doctor?.id_doctor);
    return `${nombreDoctor(doctorCompleto ?? horario.doctor)} 
    ${horario.doctor?.matricula ?? ""} ${horario.dia_semana} ${horario.hora_inicio} ${horario.hora_fin}`
      .toLowerCase()
      .includes(busqueda.toLowerCase());
  });

  return (
    <LayoutPortal>
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-cyan-600">
            Gestion de Horarios
          </h1>

          <input type="text" placeholder="Buscar horario..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="border border-slate-300 rounded-xl px-4 py-3 w-80 focus:outline-none focus:ring-2 focus:ring-cyan-500" />

          <button onClick={() => setMostrarModal(true)} className="bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-3 rounded-xl font-semibold" >
            Nuevo Horario
          </button>
        </div>

        {cargando ? ( <p>Cargando horarios...</p> ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Doctor</th>
                  <th className="text-left py-3">Dia</th>
                  <th className="text-left py-3">Hora inicio</th>
                  <th className="text-left py-3">Hora fin</th>
                  <th className="text-left py-3">Duracion</th>
                  <th className="text-left py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {horariosFiltrados.map((horario) => {const doctorCompleto = obtenerDoctorCompleto( horario.doctor?.id_doctor);
                  return (
                    <tr key={horario.id_horario} className="border-b">
                      <td className="py-3">
                        {nombreDoctor(doctorCompleto ?? horario.doctor)}
                      </td>
                      <td>{horario.dia_semana}</td>
                      <td>{normalizarHora(horario.hora_inicio)}</td>
                      <td>{normalizarHora(horario.hora_fin)}</td>
                      <td>{horario.duracion_cita_minutos} min</td>
                      <td className="space-x-2 py-3">
                        <button onClick={() => abrirEditar(horario)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg" >
                          Editar
                        </button>
                        <button onClick={() => eliminarHorario(horario.id_horario)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg" >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {horariosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500">
                      No se encontraron horarios.
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
              {modoEdicion ? "Editar Horario" : "Nuevo Horario"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Doctor
                </label>
                <select value={formulario.id_doctor} onChange={(e) =>   actualizarCampo("id_doctor", Number(e.target.value)) }
                  className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    errores.id_doctor ? "border-red-400 bg-red-50" : "border-slate-300"}`}
                >
                <option value={0}>Seleccione un doctor</option>
                  {doctores.map((doctor) => (
                    <option key={doctor.id_doctor} value={doctor.id_doctor}>
                      {nombreDoctor(doctor)} - {doctor.matricula}
                    </option>
                  ))}
                </select>
                {errores.id_doctor && (
                  <p className="text-red-500 text-xs mt-1">
                    {errores.id_doctor}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Dia de semana
                </label>
                <select value={formulario.dia_semana} onChange={(e) => actualizarCampo("dia_semana", e.target.value as DiaSemana) }
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {DIAS_SEMANA.map((dia) => (
                    <option key={dia} value={dia}>
                      {dia}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Hora inicio
                  </label>
                  <input type="time" value={formulario.hora_inicio} min="08:00" max="20:00" step={60} onChange={(e) =>   actualizarCampo("hora_inicio", e.target.value) }
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                              errores.hora_inicio ? "border-red-400 bg-red-50" : "border-slate-300"
                              }`}
                  />
                  {errores.hora_inicio && (
                    <p className="text-red-500 text-xs mt-1">
                      {errores.hora_inicio}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Hora fin
                  </label>
                  <input type="time" value={formulario.hora_fin} min="08:00" max="20:00" step={60} onChange={(e) => actualizarCampo("hora_fin", e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                                errores.hora_fin ? "border-red-400 bg-red-50" : "border-slate-300"
                              }`}
                  />
                  {errores.hora_fin && (
                    <p className="text-red-500 text-xs mt-1">
                      {errores.hora_fin}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Duracion
                  </label>
                  <input type="number" min={10} max={120} step={1} value={formulario.duracion_cita_minutos} onChange={(e) => actualizarCampo( "duracion_cita_minutos", Number(e.target.value)) }
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                                errores.duracion_cita_minutos ? "border-red-400 bg-red-50" : "border-slate-300"
                              }`}
                  />
                  {errores.duracion_cita_minutos && (
                    <p className="text-red-500 text-xs mt-1">
                      {errores.duracion_cita_minutos}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={cerrarModal} className="bg-slate-200 hover:bg-slate-300 px-5 py-3 rounded-xl font-medium" >
                Cancelar
              </button>
              <button onClick={guardarHorario} disabled={guardando} className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-60 text-white px-5 py-3 rounded-xl font-semibold" >
                {guardando ? "Guardando..." : modoEdicion   ? "Actualizar"   : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </LayoutPortal>
  );
}
