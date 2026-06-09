import { useEffect, useMemo, useState } from "react";
import LayoutPortal from "../../componentes/estructura/LayoutPortal";
import { authService } from "../../servicios/auth.service";
import { citaService, type Cita } from "../../servicios/cita.service";
import { doctorService } from "../../servicios/doctor.service";
import {
  signoVitalService,
  type CrearSignoVitalDto,
  type SignoVital,
} from "../../servicios/signoVital.service";
import { obtenerMensajeError } from "../../utilidades/apiErrores";

interface PerfilAuth {
  sub: number;
  correo: string;
  rol: string;
}

const FORMULARIO_VACIO = {
  id_cita: 0,
  peso: "",
  altura: "",
  temperatura: "",
  presion_arterial: "",
  frecuencia_cardiaca: "",
  saturacion_oxigeno: "",
};

function normalizarHora(hora: string) {
  return hora.substring(0, 5);
}

function nombrePaciente(cita?: Cita) {
  if (!cita?.paciente?.usuario) return "Paciente no disponible";
  return `${cita.paciente.usuario.nombre} ${cita.paciente.usuario.apellido}`;
}

function numeroOpcional(valor: string) {
  return valor.trim() === "" ? undefined : Number(valor);
}

export default function SignosVitalesDoctor() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [signos, setSignos] = useState<SignoVital[]>([]);
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

      const [citasDoctor, signosTodos] = await Promise.all([
        citaService.obtenerTodos({ doctor: doctorActual.id_doctor }),
        signoVitalService.obtenerTodos(),
      ]);
      setCitas(citasDoctor);
      setSignos(
        signosTodos.filter((signo) =>
          citasDoctor.some((cita) => cita.id_cita === signo.cita.id_cita),
        ),
      );
    } catch (error) {
      console.error(error);
      setError(
        obtenerMensajeError(error, "No fue posible cargar signos vitales."),
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
    return atendida && !tieneSignos;
  });

  const signosFiltrados = useMemo(
    () =>
      signos.filter((signo) => {
        const cita = citas.find((item) => item.id_cita === signo.cita.id_cita);
        return `${nombrePaciente(cita)} ${cita?.fecha ?? ""} ${signo.presion_arterial ?? ""}`
          .toLowerCase()
          .includes(busqueda.toLowerCase());
      }),
    [busqueda, citas, signos],
  );

  function actualizarCampo(campo: keyof typeof FORMULARIO_VACIO, valor: string) {
    setFormulario((prev) => ({ ...prev, [campo]: valor }));
  }

  async function guardarSignos() {
    if (!formulario.id_cita) {
      alert("Seleccione una cita atendida.");
      return;
    }

    try {
      setGuardando(true);
      const datos: CrearSignoVitalDto = {
        id_cita: Number(formulario.id_cita),
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
      await signoVitalService.crear(datos);
      setFormulario(FORMULARIO_VACIO);
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert(
        obtenerMensajeError(error, "No fue posible registrar signos vitales."),
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
              Signos Vitales
            </h1>
            <input
              type="text"
              placeholder="Buscar registro..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="border border-slate-300 rounded-xl px-4 py-3 w-80 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {cargando ? (
            <p>Cargando signos vitales...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3">Paciente</th>
                    <th className="text-left py-3">Fecha</th>
                    <th className="text-left py-3">Peso</th>
                    <th className="text-left py-3">Temperatura</th>
                    <th className="text-left py-3">Presion</th>
                  </tr>
                </thead>
                <tbody>
                  {signosFiltrados.map((signo) => {
                    const cita = citas.find((item) => item.id_cita === signo.cita.id_cita);
                    return (
                      <tr key={signo.id_signo} className="border-b">
                        <td className="py-3">{nombrePaciente(cita)}</td>
                        <td>{cita ? `${cita.fecha} ${normalizarHora(cita.hora)}` : "No disponible"}</td>
                        <td>{signo.peso ?? "No registrado"}</td>
                        <td>{signo.temperatura ?? "No registrado"}</td>
                        <td>{signo.presion_arterial || "No registrado"}</td>
                      </tr>
                    );
                  })}
                  {signosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500">
                        No se encontraron signos vitales.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Nuevo Registro</h2>
          <div className="space-y-4">
            <select
              value={formulario.id_cita}
              onChange={(e) => actualizarCampo("id_cita", e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value={0}>Seleccione una cita atendida</option>
              {citasDisponibles.map((cita) => (
                <option key={cita.id_cita} value={cita.id_cita}>
                  {cita.fecha} {normalizarHora(cita.hora)} - {nombrePaciente(cita)}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                ["peso", "Peso"],
                ["altura", "Altura"],
                ["temperatura", "Temperatura"],
                ["frecuencia_cardiaca", "Frecuencia cardiaca"],
                ["saturacion_oxigeno", "Saturacion oxigeno"],
                ["presion_arterial", "Presion arterial"],
              ].map(([campo, etiqueta]) => (
                <input
                  key={campo}
                  type={campo === "presion_arterial" ? "text" : "number"}
                  placeholder={etiqueta}
                  value={formulario[campo as keyof typeof FORMULARIO_VACIO]}
                  onChange={(e) =>
                    actualizarCampo(campo as keyof typeof FORMULARIO_VACIO, e.target.value)
                  }
                  className="border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              ))}
            </div>
            <div className="flex justify-end">
              <button
                onClick={guardarSignos}
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
