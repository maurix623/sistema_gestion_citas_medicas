import { useEffect, useState } from "react";
import { doctorService, type Doctor } from "../../servicios/doctor.service";
import {
  horarioAtencionService,
  type HorarioAtencion,
} from "../../servicios/horarioAtencion.service";
import { obtenerMensajeError } from "../../utilidades/apiErrores";

function normalizarHora(hora: string) {
  return hora.substring(0, 5);
}

export default function Especialistas() {
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [horarios, setHorarios] = useState<HorarioAtencion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  async function cargarDatos() {
    try {
      setCargando(true);

      const [doctoresData, horariosData] = await Promise.all([
        doctorService.obtenerTodos(),
        horarioAtencionService.obtenerTodos(),
      ]);

      setDoctores(doctoresData);
      setHorarios(horariosData);
    } catch (error) {
      console.error(error);

      setError(
        obtenerMensajeError(
          error,
          "No fue posible cargar los especialistas.",
        ),
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-bold text-cyan-600">
            Nuestros Especialistas
          </h1>

          <p className="text-slate-600 mt-4">
            Conoce nuestros médicos, especialidades y horarios de atención.
          </p>
        </div>

        {cargando ? (
          <p className="text-center">Cargando especialistas...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {doctores.map((doctor) => {
              const horariosDoctor = horarios.filter(
                (horario) =>
                  horario.doctor.id_doctor === doctor.id_doctor,
              );

              return (
                <div
                  key={doctor.id_doctor}
                  className="bg-white rounded-3xl shadow-lg p-6"
                >
                  <h2 className="text-2xl font-bold text-slate-800">
                    Dr. {doctor.usuario.nombre}{" "}
                    {doctor.usuario.apellido}
                  </h2>

                  <p className="text-cyan-600 font-semibold mt-2">
                    {doctor.especialidad.nombre}
                  </p>

                  {doctor.descripcion && (
                    <p className="text-slate-600 mt-3">
                      {doctor.descripcion}
                    </p>
                  )}

                  <div className="mt-6">
                    <h3 className="font-semibold text-slate-700 mb-2">
                      Horarios de atención
                    </h3>

                    {horariosDoctor.length > 0 ? (
                      <div className="space-y-2">
                        {horariosDoctor.map((horario) => (
                          <div
                            key={horario.id_horario}
                            className="bg-slate-100 rounded-xl px-3 py-2"
                          >
                            <p className="font-medium">
                              {horario.dia_semana}
                            </p>

                            <p className="text-sm text-slate-600">
                              {normalizarHora(
                                horario.hora_inicio,
                              )}{" "}
                              -{" "}
                              {normalizarHora(
                                horario.hora_fin,
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500">
                        Sin horarios registrados.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}