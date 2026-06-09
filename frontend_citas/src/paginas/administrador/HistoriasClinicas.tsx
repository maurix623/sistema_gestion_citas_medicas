import { useEffect, useMemo, useState } from "react";
import LayoutPortal from "../../componentes/estructura/LayoutPortal";
import { citaService, type Cita } from "../../servicios/cita.service";
import {historiaClinicaService,type ActualizarHistoriaClinicaDto,type CrearHistoriaClinicaDto,type HistoriaClinica,} from "../../servicios/historiaClinica.service";
import {signoVitalService,type SignoVital} from "../../servicios/signoVital.service";
import { obtenerMensajeError } from "../../utilidades/apiErrores";

const HISTORIA_VACIA = {
  id_cita: 0,
  diagnostico: "",
  tratamiento: "",
  notas_medicas: "",
};

const ERRORES_VACIOS = {
  id_cita: "",
  diagnostico: "",
  tratamiento: "",
  notas_medicas: "",
};

function normalizarHora(hora?: string) {
  return hora ? hora.substring(0, 5) : "";
}

function nombrePaciente(cita?: Cita) {
  if (!cita?.paciente?.usuario) return "Paciente no disponible";
  return `${cita.paciente.usuario.nombre} ${cita.paciente.usuario.apellido}`;
}

function nombreDoctor(cita?: Cita) {
  if (!cita?.doctor?.usuario) return "Doctor no disponible";
  return `${cita.doctor.usuario.nombre} ${cita.doctor.usuario.apellido}`;
}

function textoCita(cita?: Cita) {
  if (!cita) return "Cita no disponible";
  return `${cita.fecha} ${normalizarHora(cita.hora)} - ${nombrePaciente(cita)}`;
}

function validarHistoria(historia: typeof HISTORIA_VACIA, modoEdicion = false) {
  const errores = { ...ERRORES_VACIOS };

  if (!modoEdicion && !historia.id_cita) {
    errores.id_cita = "Seleccione una cita atendida.";
  }

  if (!historia.diagnostico.trim()) {
    errores.diagnostico = "El diagnostico es obligatorio.";
  } else if (historia.diagnostico.trim().length > 200) {
    errores.diagnostico = "Maximo 200 caracteres.";
  }

  if (historia.tratamiento.trim().length > 200) {
    errores.tratamiento = "Maximo 200 caracteres.";
  }

  if (historia.notas_medicas.trim().length > 200) {
    errores.notas_medicas = "Maximo 200 caracteres.";
  }

  const esValido = Object.values(errores).every((error) => error === "");
  return { errores, esValido };
}

export default function HistoriasClinicas() {
  const [historias, setHistorias] = useState<HistoriaClinica[]>([]);
  const [signos, setSignos] = useState<SignoVital[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [historiaEditando, setHistoriaEditando] = useState<HistoriaClinica | null>(null);
  const [formulario, setFormulario] = useState(HISTORIA_VACIA);
  const [errores, setErrores] = useState(ERRORES_VACIOS);

  async function cargarDatos() {
    try {
      setCargando(true);
      const [datosHistorias, datosSignos, datosCitas] = await Promise.all([
        historiaClinicaService.obtenerTodos(),
        signoVitalService.obtenerTodos(),
        citaService.obtenerTodos(),
      ]);
      setHistorias(datosHistorias);
      setSignos(datosSignos);
      setCitas(datosCitas);
    } 
    catch (error) {
      console.error(error);
      alert(obtenerMensajeError(error, "No fue posible cargar historias clinicas."),);
    } 
    finally {setCargando(false);}
  }

  function obtenerCitaCompleta(idCita?: number) {
    return citas.find((cita) => cita.id_cita === idCita);
  }

  function actualizarCampo(campo: keyof typeof HISTORIA_VACIA,valor: string | number) {
    const actualizado = { ...formulario, [campo]: valor };
    setFormulario(actualizado);

    if (errores[campo]) {
      const { errores: nuevosErrores } = validarHistoria(actualizado,modoEdicion);
      setErrores((prev) => ({ ...prev, [campo]: nuevosErrores[campo] }));
    }
  }

  function cerrarModal() {
    setMostrarModal(false);
    setModoEdicion(false);
    setHistoriaEditando(null);
    setFormulario(HISTORIA_VACIA);
    setErrores(ERRORES_VACIOS);
  }

  function abrirCrear() {
    setFormulario(HISTORIA_VACIA);
    setMostrarModal(true);
  }

  function abrirEditar(historia: HistoriaClinica) {
    setModoEdicion(true);
    setHistoriaEditando(historia);
    setFormulario({
      id_cita: historia.cita.id_cita,
      diagnostico: historia.diagnostico,
      tratamiento: historia.tratamiento ?? "",
      notas_medicas: historia.notas_medicas ?? "",
    });
    setMostrarModal(true);
  }

  function construirDatos(): ActualizarHistoriaClinicaDto {
    return {
      diagnostico: formulario.diagnostico.trim(),
      tratamiento: formulario.tratamiento.trim() || undefined,
      notas_medicas: formulario.notas_medicas.trim() || undefined,
    };
  }

  async function guardarHistoria() {
    const { errores: nuevosErrores, esValido } = validarHistoria( formulario, modoEdicion );
    setErrores(nuevosErrores);
    if (!esValido) return;

    try {
      setGuardando(true);

      if (modoEdicion && historiaEditando) {
        await historiaClinicaService.actualizar( historiaEditando.id_historia, construirDatos());
      } 
      else {
        const datosCreacion: CrearHistoriaClinicaDto = {
          id_cita: Number(formulario.id_cita),
          diagnostico: formulario.diagnostico.trim(),
          tratamiento: formulario.tratamiento.trim() || undefined,
          notas_medicas: formulario.notas_medicas.trim() || undefined,
        };
        await historiaClinicaService.crear(datosCreacion);
      }

      cerrarModal();
      cargarDatos();
    } 
    catch (error) {
      console.error(error);
      alert(
        obtenerMensajeError( error, modoEdicion   ? "No fue posible actualizar la historia clinica."   : "No fue posible crear la historia clinica.",),
      );
    } 
    finally {setGuardando(false);}
  }

  useEffect(() => {cargarDatos();}, []);

  const citasDisponibles = citas.filter((cita) => {
    const estaAtendida = cita.estado === "ATENDIDA";
    const tieneSignos = signos.some((signo) => signo.cita.id_cita === cita.id_cita);
    const tieneHistoria = historias.some((historia) => historia.cita.id_cita === cita.id_cita);
    const esActual = modoEdicion && cita.id_cita === historiaEditando?.cita.id_cita;

    return estaAtendida && tieneSignos && (!tieneHistoria || esActual);
  });

  const historiasFiltradas = useMemo(
    () =>
      historias.filter((historia) => {
        const cita = obtenerCitaCompleta(historia.cita.id_cita) ?? historia.cita;
        return `${textoCita(cita)} ${nombreDoctor(cita)} ${historia.diagnostico}
        ${historia.tratamiento ?? ""} ${historia.notas_medicas ?? ""}`
          .toLowerCase()
          .includes(busqueda.toLowerCase());
      }),
    [busqueda, citas, historias],
  );

  return (
    <LayoutPortal>
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-cyan-600">
            Historias Clinicas
          </h1>

          <input type="text" placeholder="Buscar historia clinica..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="border border-slate-300 rounded-xl px-4 py-3 w-80 focus:outline-none focus:ring-2 focus:ring-cyan-500" />

          <button onClick={abrirCrear} className="bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-3 rounded-xl font-semibold" >
            Nueva Historia
          </button>
        </div>

        {cargando ? (<p>Cargando historias clinicas...</p>) : 
        (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Cita</th>
                  <th className="text-left py-3">Paciente</th>
                  <th className="text-left py-3">Doctor</th>
                  <th className="text-left py-3">Diagnostico</th>
                  <th className="text-left py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {historiasFiltradas.map((historia) => {
                  const cita = obtenerCitaCompleta(historia.cita.id_cita) ?? historia.cita;
                  return (
                    <tr key={historia.id_historia} className="border-b">
                      <td className="py-3">
                        {cita.fecha} {normalizarHora(cita.hora)}
                      </td>
                      <td>{nombrePaciente(cita)}</td>
                      <td>{nombreDoctor(cita)}</td>
                      <td>{historia.diagnostico}</td>
                      <td className="space-x-2 py-3">
                        <button onClick={() => abrirEditar(historia)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg" >
                          Editar
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {historiasFiltradas.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      No se encontraron historias clinicas.
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
              {modoEdicion ? "Editar Historia Clinica" : "Nueva Historia"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Cita atendida con signos vitales
                </label>
                <select value={formulario.id_cita} disabled={modoEdicion} onChange={(e) => actualizarCampo("id_cita", e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                              errores.id_cita ? "border-red-400 bg-red-50" : "border-slate-300" } ${modoEdicion ? "bg-slate-100" : "bg-white"}`
                            }
                >
                  <option value={0}>Seleccione una cita</option>
                  {citasDisponibles.map((cita) => (
                    <option key={cita.id_cita} value={cita.id_cita}>
                      {textoCita(cita)}
                    </option>
                  ))}
                </select>
                {errores.id_cita && (
                  <p className="text-red-500 text-xs mt-1">
                    {errores.id_cita}
                  </p>
                )}
              </div>

              {[
                ["diagnostico", "Diagnostico", 4],
                ["tratamiento", "Tratamiento", 3],
                ["notas_medicas", "Notas medicas", 3],
              ].map(([campo, etiqueta, filas]) => (
                <div key={campo}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {etiqueta}
                  </label>
                  <textarea
                    value={formulario[campo as keyof typeof HISTORIA_VACIA]}
                    maxLength={200}
                    onChange={(e) => actualizarCampo( campo as keyof typeof HISTORIA_VACIA, e.target.value)}
                    rows={Number(filas)}
                    className={`w-full rounded-xl border px-4 py-3 transition outline-none bg-white resize-none ${
                                errores[campo as keyof typeof ERRORES_VACIOS]? "border-red-500 focus:border-red-500": "border-slate-300 focus:border-cyan-500"}`
                              }
                  />
                  {errores[campo as keyof typeof ERRORES_VACIOS] && (
                    <p className="text-sm text-red-500">
                      {errores[campo as keyof typeof ERRORES_VACIOS]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={cerrarModal} className="bg-slate-200 hover:bg-slate-300 px-5 py-3 rounded-xl font-medium" >
                Cancelar
              </button>
              <button onClick={guardarHistoria} disabled={guardando} className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-60 text-white px-5 py-3 rounded-xl font-semibold" >
                {guardando ? "Guardando..." : modoEdicion   ? "Actualizar"   : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </LayoutPortal>
  );
}
