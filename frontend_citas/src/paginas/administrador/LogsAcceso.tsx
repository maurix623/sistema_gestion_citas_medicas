import { useEffect, useMemo, useState } from "react";
import LayoutPortal from "../../componentes/estructura/LayoutPortal";
import {logAccesoService,type EventoAcceso,type LogAcceso} from "../../servicios/logAcceso.service";
import { obtenerMensajeError } from "../../utilidades/apiErrores";

const FILTROS_VACIOS = {
  usuario: "",
  evento: "" as EventoAcceso | "",
  fecha: "",
};

function nombreUsuario(log: LogAcceso) {
  if (!log.usuario) return "Usuario no disponible";
  return `${log.usuario.nombre} ${log.usuario.apellido}`;
}

function formatearFecha(fecha: string) {
  if (!fecha) return "No registrada";
  const date = new Date(fecha);

  if (Number.isNaN(date.getTime())) {
    return fecha;
  }

  return date.toLocaleString();
}

export default function LogsAcceso() {
  const [logs, setLogs] = useState<LogAcceso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);

  async function cargarLogs() {
    try {
      setCargando(true);
      const data = await logAccesoService.obtenerTodos();
      setLogs(data);
    } 
    catch (error) {
      console.error(error);
      alert(obtenerMensajeError(error, "No fue posible cargar los logs."));
    } 
    finally {setCargando(false);}
  }

  function actualizarFiltro(
    campo: keyof typeof FILTROS_VACIOS,
    valor: string,
  ) {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  }

  function limpiarFiltros() {
    setFiltros(FILTROS_VACIOS);
  }

  useEffect(() => {
    cargarLogs();
  }, []);

  const usuariosDisponibles = useMemo(() => {
    const mapa = new Map<number, string>();

    logs.forEach((log) => {
      if (log.usuario) {
        mapa.set(log.usuario.id_usuario, nombreUsuario(log));
      }
    });

    return [...mapa.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [logs]);

  const logsFiltrados = useMemo(
    () =>
      logs.filter((log) => {
        const coincideBusqueda = `${nombreUsuario(log)} ${log.usuario?.correo ?? ""} 
          ${log.usuario?.rol?.nombre_rol ?? ""} ${log.evento} ${log.ip} 
          ${log.browser} ${log.fecha_hora}`
          .toLowerCase()
          .includes(busqueda.toLowerCase());

        const coincideUsuario =!filtros.usuario ||String(log.usuario?.id_usuario) === filtros.usuario;
        const coincideEvento = !filtros.evento || log.evento === filtros.evento;
        const coincideFecha = !filtros.fecha || log.fecha_hora?.startsWith(filtros.fecha);

        return ( coincideBusqueda && coincideUsuario && coincideEvento && coincideFecha );
      }),
    [busqueda, filtros, logs],
  );

  return (
    <LayoutPortal>
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-cyan-600">
            Logs de Acceso
          </h1>

          <input type="text" placeholder="Buscar log..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="border border-slate-300 rounded-xl px-4 py-3 w-80 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          <select value={filtros.usuario} onChange={(e) => actualizarFiltro("usuario", e.target.value)} className="border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500" >
            <option value="">Todos los usuarios</option>
            {usuariosDisponibles.map(([id, nombre]) => (
              <option key={id} value={id}>
                {nombre}
              </option>
            ))}
          </select>

          <select value={filtros.evento} onChange={(e) =>   actualizarFiltro("evento", e.target.value as EventoAcceso | "") } className="border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500" >
            <option value="">Todos los eventos</option>
            <option value="INGRESO">INGRESO</option>
            <option value="SALIDA">SALIDA</option>
          </select>

          <input type="date" value={filtros.fecha} onChange={(e) => actualizarFiltro("fecha", e.target.value)} className="border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500" />

          <button onClick={limpiarFiltros} className="bg-slate-200 hover:bg-slate-300 px-5 py-3 rounded-xl font-medium" >
            Limpiar
          </button>
        </div>

        {cargando ? ( <p>Cargando logs...</p>) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Usuario</th>
                  <th className="text-left py-3">Correo</th>
                  <th className="text-left py-3">Rol</th>
                  <th className="text-left py-3">Evento</th>
                  <th className="text-left py-3">IP</th>
                  <th className="text-left py-3">Browser</th>
                  <th className="text-left py-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {logsFiltrados.map((log) => (
                  <tr key={log.id_log} className="border-b">
                    <td className="py-3">{nombreUsuario(log)}</td>
                    <td>{log.usuario?.correo ?? "No disponible"}</td>
                    <td>{log.usuario?.rol?.nombre_rol ?? "No disponible"}</td>
                    <td>{log.evento}</td>
                    <td>{log.ip}</td>
                    <td className="max-w-xs truncate">{log.browser}</td>
                    <td>{formatearFecha(log.fecha_hora)}</td>
                  </tr>
                ))}

                {logsFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-500">
                      No se encontraron logs.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </LayoutPortal>
  );
}
