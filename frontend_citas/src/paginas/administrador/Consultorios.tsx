import { useEffect, useState } from "react";
import LayoutPortal from "../../componentes/estructura/LayoutPortal";
import CampoTexto from "../../componentes/formularios/CampoTexto";
import {consultorioService,type ActualizarConsultorioDto,type Consultorio,type CrearConsultorioDto} from "../../servicios/consultorio.service";
import { obtenerMensajeError } from "../../utilidades/apiErrores";

const CONSULTORIO_VACIO = {
  nombre: "",
  ubicacion: "",
  descripcion: "",
};

const ERRORES_VACIOS = {
  nombre: "",
  ubicacion: "",
  descripcion: "",
};

function validarConsultorio(consultorio: typeof CONSULTORIO_VACIO) {
  const errores = { ...ERRORES_VACIOS };
  const nombre = consultorio.nombre.trim();
  const ubicacion = consultorio.ubicacion.trim();
  const descripcion = consultorio.descripcion.trim();

  if (!nombre) errores.nombre = "El nombre es obligatorio.";
  else if (nombre.length < 2) errores.nombre = "Minimo 2 caracteres.";
  else if (nombre.length > 100) errores.nombre = "Maximo 100 caracteres.";

  if (ubicacion.length > 150) errores.ubicacion = "Maximo 150 caracteres.";
  if (descripcion.length > 200) {
    errores.descripcion = "Maximo 200 caracteres.";
  }

  const esValido = Object.values(errores).every((error) => error === "");
  return { errores, esValido };
}

export default function Consultorios() {
  const [consultorios, setConsultorios] = useState<Consultorio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [consultorioEditando, setConsultorioEditando] =
    useState<Consultorio | null>(null);
  const [formulario, setFormulario] = useState(CONSULTORIO_VACIO);
  const [errores, setErrores] = useState(ERRORES_VACIOS);

  async function cargarConsultorios() {
    try {
      const data = await consultorioService.obtenerTodos();
      setConsultorios(data);
    } catch (error) {
      console.error(error);
      alert("No fue posible cargar los consultorios.");
    } finally {
      setCargando(false);
    }
  }

  function actualizarCampo(campo: keyof typeof CONSULTORIO_VACIO, valor: string) {
    const actualizado = { ...formulario, [campo]: valor };
    setFormulario(actualizado);

    if (errores[campo]) {
      const { errores: nuevosErrores } = validarConsultorio(actualizado);
      setErrores((prev) => ({ ...prev, [campo]: nuevosErrores[campo] }));
    }
  }

  function cerrarModal() {
    setMostrarModal(false);
    setModoEdicion(false);
    setConsultorioEditando(null);
    setFormulario(CONSULTORIO_VACIO);
    setErrores(ERRORES_VACIOS);
  }

  function abrirEditar(consultorio: Consultorio) {
    setModoEdicion(true);
    setConsultorioEditando(consultorio);
    setFormulario({
      nombre: consultorio.nombre,
      ubicacion: consultorio.ubicacion ?? "",
      descripcion: consultorio.descripcion ?? "",
    });
    setMostrarModal(true);
  }

  async function guardarConsultorio() {
    const { errores: nuevosErrores, esValido } =
      validarConsultorio(formulario);
    setErrores(nuevosErrores);
    if (!esValido) return;

    const datos: CrearConsultorioDto = {
      nombre: formulario.nombre.trim(),
      ubicacion: formulario.ubicacion.trim(),
      descripcion: formulario.descripcion.trim(),
    };

    try {
      setGuardando(true);

      if (modoEdicion && consultorioEditando) {
        const datosEdicion: ActualizarConsultorioDto = datos;
        await consultorioService.actualizar(
          consultorioEditando.id_consultorio,
          datosEdicion,
        );
      } else {
        await consultorioService.crear(datos);
      }

      cerrarModal();
      cargarConsultorios();
    } catch (error) {
      console.error(error);
      alert(
        obtenerMensajeError(
          error,
          modoEdicion
            ? "No fue posible actualizar el consultorio."
            : "No fue posible crear el consultorio.",
        ),
      );
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarConsultorio(id: number) {
    if (!window.confirm("Desea eliminar este consultorio?")) return;

    try {
      await consultorioService.eliminar(id);
      cargarConsultorios();
    } catch (error) {
      console.error(error);
      alert(
        obtenerMensajeError(error, "No fue posible eliminar el consultorio."),
      );
    }
  }

  useEffect(() => {
    cargarConsultorios();
  }, []);

  const consultoriosFiltrados = consultorios.filter((consultorio) =>
    `${consultorio.nombre} ${consultorio.ubicacion ?? ""} ${
      consultorio.descripcion ?? ""
    }`
      .toLowerCase()
      .includes(busqueda.toLowerCase()),
  );

  return (
    <LayoutPortal>
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-cyan-600">
            Gestion de Consultorios
          </h1>

          <input type="text" placeholder="Buscar consultorio..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="border border-slate-300 rounded-xl px-4 py-3 w-80 focus:outline-none focus:ring-2 focus:ring-cyan-500"/>
          <button onClick={() => setMostrarModal(true)} className="bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-3 rounded-xl font-semibold">
            Nuevo Consultorio
          </button>
        </div>

        {cargando ? (
          <p>Cargando consultorios...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Nombre</th>
                  <th className="text-left py-3">Ubicacion</th>
                  <th className="text-left py-3">Descripcion</th>
                  <th className="text-left py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {consultoriosFiltrados.map((consultorio) => (
                  <tr key={consultorio.id_consultorio} className="border-b">
                    <td className="py-3">{consultorio.nombre}</td>
                    <td>{consultorio.ubicacion || "Sin ubicacion"}</td>
                    <td>{consultorio.descripcion || "Sin descripcion"}</td>
                    <td className="space-x-2 py-3">
                      <button  onClick={() => abrirEditar(consultorio)}  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg">
                        Editar
                      </button>
                      <button  onClick={() =>    eliminarConsultorio(consultorio.id_consultorio)  }  className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}

                {consultoriosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500">
                      No se encontraron consultorios.
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
              {modoEdicion ? "Editar Consultorio" : "Nuevo Consultorio"}
            </h2>

            <div className="space-y-4">
              <CampoTexto  etiqueta="Nombre"  valor={formulario.nombre}  placeholder="Ingrese el nombre"  error={errores.nombre}  maxLength={100}  onChange={(valor) => actualizarCampo("nombre", valor)}/>

              <CampoTexto  etiqueta="Ubicacion"  valor={formulario.ubicacion}  placeholder="Ingrese la ubicacion"  error={errores.ubicacion}  maxLength={150}  onChange={(valor) => actualizarCampo("ubicacion", valor)}/>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Descripcion
                </label>
                <textarea  value={formulario.descripcion}  placeholder="Ingrese una descripcion opcional"  maxLength={200}
                  onChange={(e) =>
                    actualizarCampo("descripcion", e.target.value)
                  }
                  rows={4}
                  className={`w-full rounded-xl border px-4 py-3 transition outline-none bg-white resize-none ${
                    errores.descripcion
                      ? "border-red-500 focus:border-red-500"
                      : "border-slate-300 focus:border-cyan-500"
                  }`}
                />
                {errores.descripcion && (
                  <p className="text-sm text-red-500">{errores.descripcion}</p>
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
              <button
                onClick={guardarConsultorio}
                disabled={guardando}
                className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-60 text-white px-5 py-3 rounded-xl font-semibold"
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
