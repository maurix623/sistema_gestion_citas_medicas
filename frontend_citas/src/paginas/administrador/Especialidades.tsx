import { useEffect, useState } from "react";
import LayoutPortal from "../../componentes/estructura/LayoutPortal";
import CampoTexto from "../../componentes/formularios/CampoTexto";
import { especialidadService, type ActualizarEspecialidadDto, type CrearEspecialidadDto, type Especialidad } from "../../servicios/especialidad.service";
import { obtenerMensajeError } from "../../utilidades/apiErrores";

const ESPECIALIDAD_VACIA = {
  nombre: "",
  descripcion: "",
};

const ERRORES_VACIOS = {
  nombre: "",
  descripcion: "",
};

function validarEspecialidad(especialidad: typeof ESPECIALIDAD_VACIA) {
  const errores = { ...ERRORES_VACIOS };
  const nombre = especialidad.nombre.trim();
  const descripcion = especialidad.descripcion.trim();

  if (!nombre) errores.nombre = "El nombre es obligatorio.";
  else if (nombre.length < 3) errores.nombre = "Minimo 3 caracteres.";
  else if (nombre.length > 100) errores.nombre = "Maximo 100 caracteres.";

  if (descripcion.length > 255) {
    errores.descripcion = "Maximo 255 caracteres.";
  }

  const esValido = Object.values(errores).every((error) => error === "");
  return { errores, esValido };
}

export default function Especialidades() {
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [especialidadEditando, setEspecialidadEditando] = useState<Especialidad | null>(null);
  const [formulario, setFormulario] = useState(ESPECIALIDAD_VACIA);
  const [errores, setErrores] = useState(ERRORES_VACIOS);

  async function cargarEspecialidades() {
    try {
      const data = await especialidadService.obtenerTodos();
      setEspecialidades(data);
    } 
    catch (error) {
      console.error(error);
      alert("No fue posible cargar las especialidades.");
    } 
    finally {setCargando(false);}
  }

  function actualizarCampo(campo: keyof typeof ESPECIALIDAD_VACIA, valor: string) {
    const actualizado = { ...formulario, [campo]: valor };
    setFormulario(actualizado);

    if (errores[campo]) {
      const { errores: nuevosErrores } = validarEspecialidad(actualizado);
      setErrores((prev) => ({ ...prev, [campo]: nuevosErrores[campo] }));
    }
  }

  function cerrarModal() {
    setMostrarModal(false);
    setModoEdicion(false);
    setEspecialidadEditando(null);
    setFormulario(ESPECIALIDAD_VACIA);
    setErrores(ERRORES_VACIOS);
  }

  function abrirCrear() {
    setMostrarModal(true);
  }

  function abrirEditar(especialidad: Especialidad) {
    setModoEdicion(true);
    setEspecialidadEditando(especialidad);
    setFormulario({ nombre: especialidad.nombre, descripcion: especialidad.descripcion ?? "" });
    setMostrarModal(true);
  }

  async function guardarEspecialidad() {
    const { errores: nuevosErrores, esValido } = validarEspecialidad(formulario); 
    setErrores(nuevosErrores);
    if (!esValido) return;

    const datos: CrearEspecialidadDto = { nombre: formulario.nombre.trim(), descripcion: formulario.descripcion.trim()};

    try {
      setGuardando(true);

      if (modoEdicion && especialidadEditando) {
        const datosEdicion: ActualizarEspecialidadDto = datos;
        await especialidadService.actualizar( especialidadEditando.id_especialidad, datosEdicion );
      } 
      else {await especialidadService.crear(datos);}
      cerrarModal();
      cargarEspecialidades();

    } 
    catch (error) {
      console.error(error);
      alert(obtenerMensajeError( error, modoEdicion ? "No fue posible actualizar la especialidad." : "No fue posible crear la especialidad."));
    } 
    finally {setGuardando(false);}
  }

  async function eliminarEspecialidad(id: number) {
    if (!window.confirm("Desea eliminar esta especialidad?")) return;

    try {
      await especialidadService.eliminar(id);
      cargarEspecialidades();
    } 
    catch (error) {
      console.error(error);
      alert(obtenerMensajeError(error, "No fue posible eliminar la especialidad."));
    }
  }

  useEffect(() => { cargarEspecialidades(); }, []);
  const especialidadesFiltradas = especialidades.filter((especialidad) =>
    `${especialidad.nombre} ${especialidad.descripcion ?? ""}`
      .toLowerCase()
      .includes(busqueda.toLowerCase()),
  );

  return (
    <LayoutPortal>
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-cyan-600">
            Gestion de Especialidades
          </h1>

          <input type="text" placeholder="Buscar especialidad..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="border border-slate-300 rounded-xl px-4 py-3 w-80 focus:outline-none focus:ring-2 focus:ring-cyan-500" />

          <button onClick={abrirCrear} className="bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-3 rounded-xl font-semibold" >
            Nueva Especialidad
          </button>
        </div>

        {cargando ? ( <p>Cargando especialidades...</p> ) : 
        (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Nombre</th>
                  <th className="text-left py-3">Descripcion</th>
                  <th className="text-left py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {especialidadesFiltradas.map((especialidad) => (
                  <tr key={especialidad.id_especialidad} className="border-b" >
                    <td className="py-3">{especialidad.nombre}</td>
                    <td>{especialidad.descripcion || "Sin descripcion"}</td>
                    <td className="space-x-2 py-3">
                      <button onClick={() => abrirEditar(especialidad)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg" >
                        Editar
                      </button>
                      <button onClick={() => eliminarEspecialidad(especialidad.id_especialidad) } className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg" >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}

                {especialidadesFiltradas.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-500">
                      No se encontraron especialidades.
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
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-6">
              {modoEdicion ? "Editar Especialidad" : "Nueva Especialidad"}
            </h2>

            <div className="space-y-4">
              <CampoTexto etiqueta="Nombre" valor={formulario.nombre} placeholder="Ingrese el nombre" error={errores.nombre} maxLength={100} onChange={(valor) => actualizarCampo("nombre", valor)} />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Descripcion
                </label>
                <textarea value={formulario.descripcion} placeholder="Ingrese una descripcion opcional" maxLength={255}
                  onChange={(e) =>actualizarCampo("descripcion", e.target.value)}
                  rows={4}
                  className={`w-full rounded-xl border px-4 py-3 transition outline-none bg-white resize-none 
                            ${errores.descripcion  ? "border-red-500 focus:border-red-500"  : "border-slate-300 focus:border-cyan-500"}`
                  }
                />
                {errores.descripcion && ( <p className="text-sm text-red-500">{errores.descripcion}</p> )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={cerrarModal} className="bg-slate-200 hover:bg-slate-300 px-5 py-3 rounded-xl font-medium" >
                Cancelar
              </button>
              <button onClick={guardarEspecialidad} disabled={guardando} className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-60 text-white px-5 py-3 rounded-xl font-semibold" >
                {guardando ? "Guardando..." : modoEdicion   ? "Actualizar"   : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </LayoutPortal>
  );
}
