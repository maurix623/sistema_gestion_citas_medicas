import { useEffect, useState } from "react";
import LayoutPortal from "../../componentes/estructura/LayoutPortal";
import CampoTexto from "../../componentes/formularios/CampoTexto";
import {consultorioService,type Consultorio} from "../../servicios/consultorio.service";
import {doctorService,type ActualizarDoctorDto,type CrearDoctorDto,type Doctor} from "../../servicios/doctor.service";
import {especialidadService,type Especialidad} from "../../servicios/especialidad.service";
import { usuarioService, type Usuario } from "../../servicios/usuario.service";

const DOCTOR_VACIO = {
  id_usuario: 0,
  id_especialidad: 0,
  id_consultorio: 0,
  matricula: "",
  descripcion: "",
};

const ERRORES_VACIOS = {
  id_usuario: "",
  id_especialidad: "",
  id_consultorio: "",
  matricula: "",
  descripcion: "",
};

function validarDoctor(doctor: typeof DOCTOR_VACIO, modoEdicion = false) {
  const errores = { ...ERRORES_VACIOS };
  const matricula = doctor.matricula.trim();
  const descripcion = doctor.descripcion.trim();

  if (!modoEdicion && !doctor.id_usuario) {
    errores.id_usuario = "Seleccione un usuario.";
  }

  if (!doctor.id_especialidad) {
    errores.id_especialidad = "Seleccione una especialidad.";
  }

  if (!doctor.id_consultorio) {
    errores.id_consultorio = "Seleccione un consultorio.";
  }

  if (!matricula) errores.matricula = "La matricula es obligatoria.";
  else if (matricula.length < 3) errores.matricula = "Minimo 3 caracteres.";
  else if (matricula.length > 50) errores.matricula = "Maximo 50 caracteres.";

  if (descripcion.length > 100) {
    errores.descripcion = "Maximo 100 caracteres.";
  }

  const esValido = Object.values(errores).every((error) => error === "");
  return { errores, esValido };
}

function nombreUsuario(usuario?: Usuario) {
  if (!usuario) return "Sin usuario";
  return `${usuario.nombre} ${usuario.apellido}`;
}

export default function Doctores() {
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [consultorios, setConsultorios] = useState<Consultorio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [doctorEditando, setDoctorEditando] = useState<Doctor | null>(null);
  const [formulario, setFormulario] = useState(DOCTOR_VACIO);
  const [errores, setErrores] = useState(ERRORES_VACIOS);

  async function cargarDatos() {
    try {
      const [datosDoctores, datosUsuarios, datosEspecialidades, datosConsultorios] =
        await Promise.all([
          doctorService.obtenerTodos(),
          usuarioService.obtenerTodos(),
          especialidadService.obtenerTodos(),
          consultorioService.obtenerTodos(),
        ]);

      setDoctores(datosDoctores);
      setUsuarios(datosUsuarios);
      setEspecialidades(datosEspecialidades);
      setConsultorios(datosConsultorios);
    } 
    catch (error) {
      console.error(error);
      alert("No fue posible cargar los doctores.");
    } 
    finally { setCargando(false); }
  }

  function actualizarCampo( campo: keyof typeof DOCTOR_VACIO, valor: string | number ) {
    const actualizado = { ...formulario, [campo]: valor };
    setFormulario(actualizado);

    if (errores[campo]) {
      const { errores: nuevosErrores } = validarDoctor( actualizado, modoEdicion );
      setErrores((prev) => ({ ...prev, [campo]: nuevosErrores[campo] }));
    }
  }

  function cerrarModal() {
    setMostrarModal(false);
    setModoEdicion(false);
    setDoctorEditando(null);
    setFormulario(DOCTOR_VACIO);
    setErrores(ERRORES_VACIOS);
  }

  function abrirEditar(doctor: Doctor) {
    setModoEdicion(true);
    setDoctorEditando(doctor);
    setFormulario({
      id_usuario: doctor.usuario.id_usuario,
      id_especialidad: doctor.especialidad.id_especialidad,
      id_consultorio: doctor.consultorio.id_consultorio,
      matricula: doctor.matricula,
      descripcion: doctor.descripcion ?? "",
    });
    setMostrarModal(true);
  }

  async function guardarDoctor() {
    const { errores: nuevosErrores, esValido } = validarDoctor(
      formulario,
      modoEdicion,
    );
    setErrores(nuevosErrores);
    if (!esValido) return;

    try {
      setGuardando(true);

      if (modoEdicion && doctorEditando) {
        const datosEdicion: ActualizarDoctorDto = {
          id_especialidad: formulario.id_especialidad,
          id_consultorio: formulario.id_consultorio,
          matricula: formulario.matricula.trim(),
          descripcion: formulario.descripcion.trim(),
        };
        await doctorService.actualizar(doctorEditando.id_doctor, datosEdicion);
      } 
      else {
        const datosCreacion: CrearDoctorDto = {
          id_usuario: formulario.id_usuario,
          id_especialidad: formulario.id_especialidad,
          id_consultorio: formulario.id_consultorio,
          matricula: formulario.matricula.trim(),
          descripcion: formulario.descripcion.trim(),
        };
        await doctorService.crear(datosCreacion);
      }

      cerrarModal();
      cargarDatos();
    } 
    catch (error) {
      console.error(error);
      alert( modoEdicion   ? "No fue posible actualizar el doctor."   : "No fue posible crear el doctor.");
    } 
    finally {setGuardando(false);}
  }

  async function eliminarDoctor(id: number) {
    if (!window.confirm("Desea eliminar este doctor?")) return;
    try {
      await doctorService.eliminar(id);
      cargarDatos();
    } 
    catch (error) {
      console.error(error);
      alert("No fue posible eliminar el doctor.");
    }
  }

  useEffect(() => {cargarDatos();}, []);

  const doctoresFiltrados = doctores.filter((doctor) =>
    `${nombreUsuario(doctor.usuario)} ${doctor.usuario.correo} 
      ${doctor.matricula} ${doctor.especialidad?.nombre ?? ""} ${doctor.consultorio?.nombre ?? ""}`
        .toLowerCase()
        .includes(busqueda.toLowerCase()),
  );

  const usuariosDoctorDisponibles = usuarios.filter((usuario) => {
    const esDoctor = usuario.rol?.id_rol === 3;
    const yaRegistrado = doctores.some((doctor) => doctor.usuario.id_usuario === usuario.id_usuario);
    const esEditando = modoEdicion && usuario.id_usuario === doctorEditando?.usuario.id_usuario;

    return esDoctor && (!yaRegistrado || esEditando);
  });

  return (
    <LayoutPortal>
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-cyan-600">
            Gestion de Doctores
          </h1>

          <input type="text" placeholder="Buscar doctor..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="border border-slate-300 rounded-xl px-4 py-3 w-80 focus:outline-none focus:ring-2 focus:ring-cyan-500" />

          <button onClick={() => setMostrarModal(true)} className="bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-3 rounded-xl font-semibold" >
            Nuevo Doctor
          </button>
        </div>

        {cargando ? (
          <p>Cargando doctores...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Doctor</th>
                  <th className="text-left py-3">Correo</th>
                  <th className="text-left py-3">Matricula</th>
                  <th className="text-left py-3">Especialidad</th>
                  <th className="text-left py-3">Consultorio</th>
                  <th className="text-left py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {doctoresFiltrados.map((doctor) => (
                  <tr key={doctor.id_doctor} className="border-b">
                    <td className="py-3">{nombreUsuario(doctor.usuario)}</td>
                    <td>{doctor.usuario.correo}</td>
                    <td>{doctor.matricula}</td>
                    <td>{doctor.especialidad?.nombre ?? "Sin especialidad"}</td>
                    <td>{doctor.consultorio?.nombre ?? "Sin consultorio"}</td>
                    <td className="space-x-2 py-3">
                      <button onClick={() => abrirEditar(doctor)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg" >
                        Editar
                      </button>
                      <button onClick={() => eliminarDoctor(doctor.id_doctor)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg" >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}

                {doctoresFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500">
                      No se encontraron doctores.
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
              {modoEdicion ? "Editar Doctor" : "Nuevo Doctor"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Usuario
                </label>
                <select value={formulario.id_usuario} disabled={modoEdicion}
                  onChange={(e) => actualizarCampo("id_usuario", Number(e.target.value)) }
                  className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 
                              ${ errores.id_usuario   ? "border-red-400 bg-red-50"   : "border-slate-300"} 
                              ${modoEdicion ? "bg-slate-100" : "bg-white"}`
                            }
                >
                  <option value={0}>Seleccione un usuario doctor</option>
                  {usuariosDoctorDisponibles.map((usuario) => (
                    <option key={usuario.id_usuario} value={usuario.id_usuario}>
                      {nombreUsuario(usuario)} - {usuario.correo}
                    </option>
                  ))}
                </select>
                {errores.id_usuario && (
                  <p className="text-red-500 text-xs mt-1">
                    {errores.id_usuario}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Especialidad
                  </label>
                  <select value={formulario.id_especialidad}
                    onChange={(e) => actualizarCampo( "id_especialidad", Number(e.target.value) )}
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 
                                ${ errores.id_especialidad   ? "border-red-400 bg-red-50"   : "border-slate-300"}`
                              }
                  >
                    <option value={0}>Seleccione una especialidad</option>
                    {especialidades.map((especialidad) => (
                      <option key={especialidad.id_especialidad} value={especialidad.id_especialidad} >
                        {especialidad.nombre}
                      </option>
                    ))}
                  </select>
                  {errores.id_especialidad && (
                    <p className="text-red-500 text-xs mt-1">
                      {errores.id_especialidad}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Consultorio
                  </label>
                  <select value={formulario.id_consultorio} onChange={(e) => actualizarCampo( "id_consultorio", Number(e.target.value))}
                                  className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 
                                    ${ errores.id_consultorio   ? "border-red-400 bg-red-50"   : "border-slate-300"}`
                                }
                  >
                    <option value={0}>Seleccione un consultorio</option>
                    {consultorios.map((consultorio) => (
                      <option key={consultorio.id_consultorio} value={consultorio.id_consultorio} >
                        {consultorio.nombre}
                      </option>
                    ))}
                  </select>
                  {errores.id_consultorio && (
                    <p className="text-red-500 text-xs mt-1">
                      {errores.id_consultorio}
                    </p>
                  )}
                </div>
              </div>

              <CampoTexto etiqueta="Matricula" valor={formulario.matricula} placeholder="Ingrese la matricula" error={errores.matricula} maxLength={50} onChange={(valor) => actualizarCampo("matricula", valor)} />
              <CampoTexto etiqueta="Descripcion" valor={formulario.descripcion} placeholder="Ingrese una descripcion opcional" error={errores.descripcion} maxLength={100} onChange={(valor) => actualizarCampo("descripcion", valor)} />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={cerrarModal} className="bg-slate-200 hover:bg-slate-300 px-5 py-3 rounded-xl font-medium" >
                Cancelar
              </button>
              <button onClick={guardarDoctor} disabled={guardando} className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-60 text-white px-5 py-3 rounded-xl font-semibold" >
                {guardando ? "Guardando..." : modoEdicion ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </LayoutPortal>
  );
}
