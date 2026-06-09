import { api } from "./api";
import type { Usuario } from "./usuario.service";

export type EventoAcceso = "INGRESO" | "SALIDA";

export interface LogAcceso {
  id_log: number;
  ip: string;
  browser: string;
  evento: EventoAcceso;
  fecha_hora: string;
  usuario: Usuario;
}

export const logAccesoService = {
  async obtenerTodos(): Promise<LogAcceso[]> {
    const response = await api.get("/logs_acceso");
    return response.data;
  },

  async obtenerUno(id: number): Promise<LogAcceso> {
    const response = await api.get(`/logs_acceso/${id}`);
    return response.data;
  },
};
