import { useEffect, useMemo, useState } from "react";
import LayoutPortal from "../../componentes/estructura/LayoutPortal";
import { authService } from "../../servicios/auth.service";
import { doctorService } from "../../servicios/doctor.service";
import {pacienteService,type Paciente} from "../../servicios/paciente.service";
import { citaService } from "../../servicios/cita.service";

import { obtenerMensajeError } from "../../utilidades/apiErrores";

interface PerfilAuth {
  sub: number;
  correo: string;
  rol: string;
}

export default function GestionPacientesDoctor() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [pacienteEditando, setPacienteEditando] = useState<Paciente | null>(
    null,
  );
  const [tipoSangre, setTipoSangre] = useState("");
  const [sexo, setSexo] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [alergias, setAlergias] = useState("");

  async function cargarPacientes() {
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
        setError("Doctor no encontrado.");
        return;
      }

      const citas = await citaService.obtenerTodos({
        doctor: doctorActual.id_doctor,
      });

      const pacientesUnicos = citas
        .map((cita) => cita.paciente)
        .filter(
          (paciente, index, array) =>
            array.findIndex((p) => p.id_paciente === paciente.id_paciente) ===
            index,
        );

      setPacientes(pacientesUnicos);
    } catch (error) {
      console.error(error);

      setError(
        obtenerMensajeError(error, "No fue posible cargar los pacientes."),
      );
    } finally {
      setCargando(false);
    }
  }
  function abrirEdicion(paciente: Paciente) {
    setPacienteEditando(paciente);

    setTipoSangre(paciente.tipo_sangre || "");
    setSexo(paciente.sexo || "");
    setFechaNacimiento(
      paciente.fecha_nacimiento
        ? paciente.fecha_nacimiento.substring(0, 10)
        : "",
    );
    setAlergias(paciente.alergias || "");

    setModalAbierto(true);
  }

  async function guardarPaciente() {
    if (!pacienteEditando) return;

    try {
      await pacienteService.actualizar(pacienteEditando.id_paciente, {
        tipo_sangre: tipoSangre || undefined,
        sexo: sexo || undefined,
        fecha_nacimiento: fechaNacimiento || undefined,
        alergias: alergias || undefined,
      });

      await cargarPacientes();

      setModalAbierto(false);
      setPacienteEditando(null);
    } catch (error) {
      console.error(error);
      alert(
        obtenerMensajeError(error, "No fue posible actualizar el paciente."),
      );
    }
  }

  useEffect(() => {
    cargarPacientes();
  }, []);

  const pacientesFiltrados = useMemo(
    () =>
      pacientes.filter((paciente) =>
        `${paciente.usuario.nombre} ${paciente.usuario.apellido}`
          .toLowerCase()
          .includes(busqueda.toLowerCase()),
      ),
    [pacientes, busqueda],
  );

  return (
    <LayoutPortal>
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-cyan-600">Mis Pacientes</h1>

          <input
            type="text"
            placeholder="Buscar paciente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="border border-slate-300 rounded-xl px-4 py-3 w-80"
          />
        </div>

        {cargando ? (
          <p>Cargando pacientes...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Paciente</th>
                  <th className="text-left py-3">Fecha Nacimiento</th>
                  <th className="text-left py-3">Sexo</th>
                  <th className="text-left py-3">Tipo Sangre</th>
                  <th className="text-left py-3">Alergias</th>
                  <th className="text-left py-3">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {pacientesFiltrados.map((paciente) => (
                  <tr key={paciente.id_paciente} className="border-b">
                    <td className="py-3">
                      {paciente.usuario.nombre} {paciente.usuario.apellido}
                    </td>

                    <td>{paciente.fecha_nacimiento || "-"}</td>
                    <td>{paciente.sexo || "-"}</td>

                    <td>{paciente.tipo_sangre || "-"}</td>

                    <td>{paciente.alergias || "-"}</td>
                    <td>
                      <button
                        onClick={() => abrirEdicion(paciente)}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}

                {pacientesFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500">
                      No hay pacientes registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg">
            <h2 className="text-2xl font-bold text-cyan-600 mb-6">
              Editar Paciente
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Tipo de sangre</label>

                <select
                  value={tipoSangre}
                  onChange={(e) => setTipoSangre(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3"
                >
                  <option value="">Seleccione</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium">Sexo</label>

                <select
                  value={sexo}
                  onChange={(e) => setSexo(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3"
                >
                  <option value="">Seleccione</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  Fecha de nacimiento
                </label>

                <input
                  type="date"
                  value={fechaNacimiento}
                  onChange={(e) => setFechaNacimiento(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Alergias</label>

                <input
                  type="text"
                  value={alergias}
                  onChange={(e) => setAlergias(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setModalAbierto(false)}
                className="px-5 py-3 rounded-xl bg-slate-200"
              >
                Cancelar
              </button>

              <button
                onClick={guardarPaciente}
                className="px-5 py-3 rounded-xl bg-cyan-500 text-white"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </LayoutPortal>
  );
}
