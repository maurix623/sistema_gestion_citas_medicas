import { useEffect, useMemo, useState } from "react";
import LayoutPortal from "../../componentes/estructura/LayoutPortal";
import { citaService, type Cita } from "../../servicios/cita.service";
import {signoVitalService,type ActualizarSignoVitalDto,type CrearSignoVitalDto,type SignoVital} from "../../servicios/signoVital.service";
import { obtenerMensajeError } from "../../utilidades/apiErrores";

const SIGNO_VACIO = {
  id_cita: 0,
  peso: "",
  altura: "",
  temperatura: "",
  presion_arterial: "",
  frecuencia_cardiaca: "",
  saturacion_oxigeno: "",
};

const ERRORES_VACIOS = {
  id_cita: "",
  peso: "",
  altura: "",
  temperatura: "",
  presion_arterial: "",
  frecuencia_cardiaca: "",
  saturacion_oxigeno: "",
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

function numeroOpcional(valor: string) {
  return valor.trim() === "" ? undefined : Number(valor);
}

function validarSigno(signo: typeof SIGNO_VACIO, modoEdicion = false) {
  const errores = { ...ERRORES_VACIOS };

  if (!modoEdicion && !signo.id_cita) {
    errores.id_cita = "Seleccione una cita atendida.";
  }

  const rangos = {
    peso: { min: 1, max: 500, mensaje: "Debe estar entre 1 y 500." },
    altura: { min: 0.3, max: 2.5, mensaje: "Debe estar entre 0.30 y 2.50." },
    temperatura: { min: 30, max: 45, mensaje: "Debe estar entre 30 y 45." },
    frecuencia_cardiaca: {min: 20,max: 250,mensaje: "Debe estar entre 20 y 250."},
    saturacion_oxigeno: {min: 0,max: 100,mensaje: "Debe estar entre 0 y 100."},
  } as const;

  Object.entries(rangos).forEach(([campo, rango]) => {
    const clave = campo as keyof typeof rangos;
    const valor = signo[clave];
    if (valor.trim()) {
      const numero = Number(valor);
      if (Number.isNaN(numero)) {errores[clave] = "Ingrese un numero valido.";} 
      else if (numero < rango.min || numero > rango.max) {errores[clave] = rango.mensaje;}
    }
  });

  if (signo.frecuencia_cardiaca.trim() && !Number.isInteger(Number(signo.frecuencia_cardiaca))) {
    errores.frecuencia_cardiaca = "Debe ser un numero entero.";
  }

  if (signo.presion_arterial.trim().length > 20) {
    errores.presion_arterial = "Maximo 20 caracteres.";
  }

  const esValido = Object.values(errores).every((error) => error === "");
  return { errores, esValido };
}

export default function SignosVitales() {
  const [signos, setSignos] = useState<SignoVital[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [signoEditando, setSignoEditando] = useState<SignoVital | null>(null);
  const [formulario, setFormulario] = useState(SIGNO_VACIO);
  const [errores, setErrores] = useState(ERRORES_VACIOS);

  async function cargarDatos() {
    try {
      setCargando(true);
      const [datosSignos, datosCitas] = await Promise.all([
        signoVitalService.obtenerTodos(),
        citaService.obtenerTodos(),
      ]);
      setSignos(datosSignos);
      setCitas(datosCitas);
    } catch (error) {
      console.error(error);
      alert(obtenerMensajeError(error, "No fue posible cargar signos vitales."));
    } finally {
      setCargando(false);
    }
  }

  function obtenerCitaCompleta(idCita?: number) {
    return citas.find((cita) => cita.id_cita === idCita);
  }

  function actualizarCampo(campo: keyof typeof SIGNO_VACIO, valor: string | number) {
    const actualizado = { ...formulario, [campo]: String(valor) };
    setFormulario(actualizado);

    if (errores[campo]) {
      const { errores: nuevosErrores } = validarSigno(actualizado, modoEdicion);
      setErrores((prev) => ({ ...prev, [campo]: nuevosErrores[campo] }));
    }
  }

  function cerrarModal() {
    setMostrarModal(false);
    setModoEdicion(false);
    setSignoEditando(null);
    setFormulario(SIGNO_VACIO);
    setErrores(ERRORES_VACIOS);
  }

  function abrirCrear() {
    setFormulario(SIGNO_VACIO);
    setMostrarModal(true);
  }

  function abrirEditar(signo: SignoVital) {
    setModoEdicion(true);
    setSignoEditando(signo);
    setFormulario({
      id_cita: signo.cita.id_cita,
      peso: signo.peso?.toString() ?? "",
      altura: signo.altura?.toString() ?? "",
      temperatura: signo.temperatura?.toString() ?? "",
      presion_arterial: signo.presion_arterial ?? "",
      frecuencia_cardiaca: signo.frecuencia_cardiaca?.toString() ?? "",
      saturacion_oxigeno: signo.saturacion_oxigeno?.toString() ?? "",
    });
    setMostrarModal(true);
  }

  function construirDatos(): ActualizarSignoVitalDto {
    return {
      peso: numeroOpcional(formulario.peso),
      altura: numeroOpcional(formulario.altura),
      temperatura: numeroOpcional(formulario.temperatura),
      presion_arterial: formulario.presion_arterial.trim() || undefined,
      frecuencia_cardiaca:
        formulario.frecuencia_cardiaca.trim() === ""
          ? undefined
          : Number(formulario.frecuencia_cardiaca),
      saturacion_oxigeno: numeroOpcional(formulario.saturacion_oxigeno),
    };
  }

  async function guardarSigno() {
    const { errores: nuevosErrores, esValido } = validarSigno( formulario, modoEdicion );
    setErrores(nuevosErrores);
    if (!esValido) return;

    try {
      setGuardando(true);
      if (modoEdicion && signoEditando) {
        await signoVitalService.actualizar( signoEditando.id_signo, construirDatos() );
      } 
      else {
        const datosCreacion: CrearSignoVitalDto = { id_cita: Number(formulario.id_cita), ...construirDatos() };
        await signoVitalService.crear(datosCreacion);
      }

      cerrarModal();
      cargarDatos();
    } 
    catch (error) {
      console.error(error);
      alert(obtenerMensajeError(error,  modoEdicion  ? "No fue posible actualizar los signos vitales."  : "No fue posible crear los signos vitales.",));
    } 
    finally {setGuardando(false);}
  }

  useEffect(() => {cargarDatos();}, []);

  const citasDisponibles = citas.filter((cita) => {
    const estaAtendida = cita.estado === "ATENDIDA";
    const tieneSignos = signos.some(
      (signo) => signo.cita.id_cita === cita.id_cita,
    );
    const esActual =modoEdicion && cita.id_cita === signoEditando?.cita.id_cita;

    return estaAtendida && (!tieneSignos || esActual);
  });

  const signosFiltrados = useMemo(
    () =>
      signos.filter((signo) => {
        const cita = obtenerCitaCompleta(signo.cita.id_cita) ?? signo.cita;
        return `${textoCita(cita)} ${nombreDoctor(cita)} ${signo.presion_arterial ?? ""} ${signo.peso ?? ""} ${signo.temperatura ?? ""}`
          .toLowerCase()
          .includes(busqueda.toLowerCase());
      }),
    [busqueda, citas, signos],
  );

  return (
    <LayoutPortal>
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-cyan-600">Signos Vitales</h1>

          <input type="text" placeholder="Buscar signos vitales..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="border border-slate-300 rounded-xl px-4 py-3 w-80 focus:outline-none focus:ring-2 focus:ring-cyan-500" />

          <button onClick={abrirCrear} className="bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-3 rounded-xl font-semibold" >
            Nuevo Registro
          </button>
        </div>

        {cargando ? ( <p>Cargando signos vitales...</p> ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Cita</th>
                  <th className="text-left py-3">Paciente</th>
                  <th className="text-left py-3">Peso</th>
                  <th className="text-left py-3">Temperatura</th>
                  <th className="text-left py-3">Presion</th>
                  <th className="text-left py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {signosFiltrados.map((signo) => {
                  const cita = obtenerCitaCompleta(signo.cita.id_cita) ?? signo.cita;

                  return (
                    <tr key={signo.id_signo} className="border-b">
                      <td className="py-3">
                        {cita.fecha} {normalizarHora(cita.hora)}
                      </td>
                      <td>{nombrePaciente(cita)}</td>
                      <td>{signo.peso ?? "No registrado"}</td>
                      <td>{signo.temperatura ?? "No registrado"}</td>
                      <td>{signo.presion_arterial || "No registrado"}</td>
                      <td className="space-x-2 py-3">
                        <button onClick={() => abrirEditar(signo)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg" >
                          Editar
                        </button>
                      </td>
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

      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">
              {modoEdicion ? "Editar Signos Vitales" : "Nuevo Registro"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Cita atendida
                </label>
                <select value={formulario.id_cita} disabled={modoEdicion} onChange={(e) => actualizarCampo("id_cita", e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    errores.id_cita ? "border-red-400 bg-red-50" : "border-slate-300" } ${modoEdicion ? "bg-slate-100" : "bg-white"}`}
                >
                  <option value={0}>Seleccione una cita atendida</option>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  ["peso", "Peso", 1, 500, "0.01"],
                  ["altura", "Altura", 0.3, 2.5, "0.01"],
                  ["temperatura", "Temperatura", 30, 45, "0.01"],
                  ["frecuencia_cardiaca", "Frecuencia cardiaca", 20, 250, "1"],
                  ["saturacion_oxigeno", "Saturacion oxigeno", 0, 100, "0.01"],
                ].map(([campo, etiqueta, min, max, step]) => (
                  <div key={campo}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {etiqueta}
                    </label>
                    <input type="number" min={min} max={max} step={step} value={formulario[campo as keyof typeof SIGNO_VACIO]}
                      onChange={(e) =>actualizarCampo(  campo as keyof typeof SIGNO_VACIO,  e.target.value,)}
                      className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                        errores[campo as keyof typeof ERRORES_VACIOS] ? "border-red-400 bg-red-50" : "border-slate-300"}`}
                    />
                    {errores[campo as keyof typeof ERRORES_VACIOS] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errores[campo as keyof typeof ERRORES_VACIOS]}
                      </p>
                    )}
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Presion arterial
                  </label>
                  <input type="text" value={formulario.presion_arterial} placeholder="120/80" maxLength={20}
                    onChange={(e) => actualizarCampo("presion_arterial", e.target.value) }
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                      errores.presion_arterial ? "border-red-400 bg-red-50" : "border-slate-300"}`}
                  />
                  {errores.presion_arterial && (
                    <p className="text-red-500 text-xs mt-1">
                      {errores.presion_arterial}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={cerrarModal} className="bg-slate-200 hover:bg-slate-300 px-5 py-3 rounded-xl font-medium" >
                Cancelar
              </button>
              <button onClick={guardarSigno} disabled={guardando} className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-60 text-white px-5 py-3 rounded-xl font-semibold" >
                {guardando ? "Guardando..." : modoEdicion ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </LayoutPortal>
  );
}
