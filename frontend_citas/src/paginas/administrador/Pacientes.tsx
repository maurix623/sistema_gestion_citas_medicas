import { useEffect, useState } from "react";
import LayoutPortal from "../../componentes/estructura/LayoutPortal";
import CampoTexto from "../../componentes/formularios/CampoTexto";
import { pacienteService, type ActualizarPacienteDto, type CrearPacienteDto, type Paciente} from "../../servicios/paciente.service";
import { usuarioService, type Usuario } from "../../servicios/usuario.service";

const TIPOS_SANGRE = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const PACIENTE_VACIO = {
  id_usuario: 0,
  tipo_sangre: "",
  alergias: "",
  fecha_nacimiento: "",
  sexo: "",
};

const ERRORES_VACIOS = {
  id_usuario: "",
  tipo_sangre: "",
  alergias: "",
  fecha_nacimiento: "",
  sexo: "",
};

function validarPaciente(paciente: typeof PACIENTE_VACIO, modoEdicion = false) {
  const errores = { ...ERRORES_VACIOS };

  if (!modoEdicion && !paciente.id_usuario) {
    errores.id_usuario = "Seleccione un usuario.";
  }

  if (paciente.tipo_sangre && !TIPOS_SANGRE.includes(paciente.tipo_sangre)) {
    errores.tipo_sangre = "Seleccione un tipo de sangre valido.";
  }

  if (paciente.alergias.trim().length > 100) {
    errores.alergias = "Maximo 100 caracteres.";
  }

  if (paciente.fecha_nacimiento) {
    const fechaNacimiento = new Date(`${paciente.fecha_nacimiento}T00:00:00`);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (Number.isNaN(fechaNacimiento.getTime())) {
      errores.fecha_nacimiento = "Ingrese una fecha valida.";
    } else if (fechaNacimiento > hoy) {
      errores.fecha_nacimiento = "La fecha no puede ser futura.";
    }
  }

  if (paciente.sexo && !["M", "F"].includes(paciente.sexo)) {
    errores.sexo = "Seleccione un sexo valido.";
  }

  const esValido = Object.values(errores).every((error) => error === "");
  return { errores, esValido };
}

function nombreUsuario(usuario?: Usuario) {
  if (!usuario) return "Sin usuario";
  return `${usuario.nombre} ${usuario.apellido}`;
}

export default function Pacientes() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [pacienteEditando, setPacienteEditando] = useState<Paciente | null>(null);
  const [formulario, setFormulario] = useState(PACIENTE_VACIO);
  const [errores, setErrores] = useState(ERRORES_VACIOS);

  async function cargarDatos() {
    try {
      const [datosPacientes, datosUsuarios] = await Promise.all([
        pacienteService.obtenerTodos(),
        usuarioService.obtenerTodos(),
      ]);
      setPacientes(datosPacientes);
      setUsuarios(datosUsuarios);
    } catch (error) {
      console.error(error);
      alert("No fue posible cargar los pacientes.");
    } finally {
      setCargando(false);
    }
  }

  function actualizarCampo(
    campo: keyof typeof PACIENTE_VACIO,
    valor: string | number,
  ) {
    const actualizado = { ...formulario, [campo]: valor };
    setFormulario(actualizado);

    if (errores[campo]) {
      const { errores: nuevosErrores } = validarPaciente(
        actualizado,
        modoEdicion,
      );
      setErrores((prev) => ({ ...prev, [campo]: nuevosErrores[campo] }));
    }
  }

  function cerrarModal() {
    setMostrarModal(false);
    setModoEdicion(false);
    setPacienteEditando(null);
    setFormulario(PACIENTE_VACIO);
    setErrores(ERRORES_VACIOS);
  }

  function abrirEditar(paciente: Paciente) {
    setModoEdicion(true);
    setPacienteEditando(paciente);
    setFormulario({
      id_usuario: paciente.usuario.id_usuario,
      tipo_sangre: paciente.tipo_sangre ?? "",
      alergias: paciente.alergias ?? "",
      fecha_nacimiento: paciente.fecha_nacimiento ?? "",
      sexo: paciente.sexo ?? "",
    });
    setMostrarModal(true);
  }

  function limpiarOpcionales() {
    return {
      tipo_sangre: formulario.tipo_sangre || undefined,
      alergias: formulario.alergias.trim() || undefined,
      fecha_nacimiento: formulario.fecha_nacimiento || undefined,
      sexo: formulario.sexo || undefined,
    };
  }

  async function guardarPaciente() {
    const { errores: nuevosErrores, esValido } = validarPaciente(formulario,modoEdicion);
    setErrores(nuevosErrores);
    if (!esValido) return;

    try {
      setGuardando(true);

      if (modoEdicion && pacienteEditando) {
        const datosEdicion: ActualizarPacienteDto = { id_usuario: formulario.id_usuario, ...limpiarOpcionales() };
        await pacienteService.actualizar( pacienteEditando.id_paciente, datosEdicion );
      } 
      else {
        const datosCreacion: CrearPacienteDto = { id_usuario: formulario.id_usuario, ...limpiarOpcionales() };
        await pacienteService.crear(datosCreacion);
      }

      cerrarModal();
      cargarDatos();
    } 
    catch (error) {
      console.error(error);
      alert( modoEdicion ? "No fue posible actualizar el paciente." : "No fue posible crear el paciente.");
    } 
    finally {setGuardando(false);}
  }

  async function eliminarPaciente(id: number) {
    if (!window.confirm("Desea eliminar este paciente?")) return;

    try {
      await pacienteService.eliminar(id);
      cargarDatos();
    } 
    catch (error) {
      console.error(error);
      alert("No fue posible eliminar el paciente.");
    }
  }

  useEffect(() => {cargarDatos();}, []);

  const pacientesFiltrados = pacientes.filter((paciente) =>
    `${nombreUsuario(paciente.usuario)} ${paciente.usuario.correo} ${
      paciente.usuario.telefono
    } ${paciente.tipo_sangre ?? ""} ${paciente.alergias ?? ""}`
      .toLowerCase()
      .includes(busqueda.toLowerCase()),
  );

  const usuariosPacienteDisponibles = usuarios.filter((usuario) => {
    const esPaciente = usuario.rol?.id_rol === 2;
    const yaRegistrado = pacientes.some((paciente) => paciente.usuario.id_usuario === usuario.id_usuario);
    const esEditando = modoEdicion && usuario.id_usuario === pacienteEditando?.usuario.id_usuario;

    return esPaciente && (!yaRegistrado || esEditando);
  });

  return (
    <LayoutPortal>
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-cyan-600">
            Gestion de Pacientes
          </h1>

          <input type="text" placeholder="Buscar paciente..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="border border-slate-300 rounded-xl px-4 py-3 w-80 focus:outline-none focus:ring-2 focus:ring-cyan-500"/>
          <button onClick={() => setMostrarModal(true)} className="bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-3 rounded-xl font-semibold" >
            Nuevo Paciente
          </button>
        </div>

        {cargando ? (<p>Cargando pacientes...</p>) : 
        (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Paciente</th>
                  <th className="text-left py-3">Correo</th>
                  <th className="text-left py-3">Telefono</th>
                  <th className="text-left py-3">Tipo sangre</th>
                  <th className="text-left py-3">Sexo</th>
                  <th className="text-left py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pacientesFiltrados.map((paciente) => (
                  <tr key={paciente.id_paciente} className="border-b">
                    <td className="py-3">{nombreUsuario(paciente.usuario)}</td>
                    <td>{paciente.usuario.correo}</td>
                    <td>{paciente.usuario.telefono}</td>
                    <td>{paciente.tipo_sangre || "No registrado"}</td>
                    <td>{paciente.sexo || "No registrado"}</td>
                    <td className="space-x-2 py-3">
                      <button onClick={() => abrirEditar(paciente)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg" >
                        Editar
                      </button>
                      <button onClick={() => eliminarPaciente(paciente.id_paciente)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg" >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}

                {pacientesFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500">
                      No se encontraron pacientes.
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
              {modoEdicion ? "Editar Paciente" : "Nuevo Paciente"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Usuario
                </label>
                <select value={formulario.id_usuario} disabled={modoEdicion} onChange={(e) => actualizarCampo("id_usuario", Number(e.target.value)) }
                  className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    errores.id_usuario ? "border-red-400 bg-red-50" : "border-slate-300"} ${modoEdicion ? "bg-slate-100" : "bg-white"}`}
                >
                  <option value={0}>Seleccione un usuario paciente</option>
                  {usuariosPacienteDisponibles.map((usuario) => (
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
                    Tipo de sangre
                  </label>
                  <select value={formulario.tipo_sangre} onChange={(e) =>   actualizarCampo("tipo_sangre", e.target.value) } className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500" >
                    <option value="">No registrado</option>
                    {TIPOS_SANGRE.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Sexo
                  </label>
                  <select value={formulario.sexo} onChange={(e) => actualizarCampo("sexo", e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500" >
                    <option value="">No registrado</option>
                    <option value="M">M</option>
                    <option value="F">F</option>
                  </select>
                </div>
              </div>

              <CampoTexto etiqueta="Fecha de nacimiento" tipo="date" valor={formulario.fecha_nacimiento} max={new Date().toISOString().slice(0, 10)} error={errores.fecha_nacimiento} onChange={(valor) =>   actualizarCampo("fecha_nacimiento", valor) } />
              <CampoTexto etiqueta="Alergias" valor={formulario.alergias} placeholder="Ingrese alergias si aplica" error={errores.alergias} maxLength={100} onChange={(valor) => actualizarCampo("alergias", valor)} />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={cerrarModal} className="bg-slate-200 hover:bg-slate-300 px-5 py-3 rounded-xl font-medium" >
                Cancelar
              </button>
              <button onClick={guardarPaciente} disabled={guardando} className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-60 text-white px-5 py-3 rounded-xl font-semibold" >
                {guardando ? "Guardando..." : modoEdicion   ? "Actualizar"   : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </LayoutPortal>
  );
}
