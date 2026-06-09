import { api } from "./api";
import type { Doctor } from "./doctor.service";
import type { Paciente } from "./paciente.service";

export type EstadoCita =
  | "PROGRAMADA"
  | "CONFIRMADA"
  | "ATENDIDA"
  | "CANCELADA";

export interface Cita {
  id_cita: number;
  fecha: string;
  hora: string;
  estado: EstadoCita;
  observaciones?: string | null;
  paciente: Paciente;
  doctor: Doctor;
  creadoEn?: string;
  actualizadoEn?: string;
  eliminadoEn?: string | null;
}

export interface CrearCitaDto {
  id_paciente: number;
  id_doctor: number;
  fecha: string;
  hora: string;
  observaciones?: string;
}

export interface ActualizarCitaDto {
  fecha?: string;
  hora?: string;
  estado?: EstadoCita;
  observaciones?: string;
}

export interface FiltrosCita {
  fecha?: string;
  estado?: EstadoCita | "";
  doctor?: number;
  paciente?: number;
}

export interface HorariosDisponibles {
  doctor: number;
  fecha: string;
  horarios_disponibles: string[];
}

export const citaService = {
  async obtenerTodos(filtros: FiltrosCita = {}): Promise<Cita[]> {
    const params = {
      ...(filtros.fecha ? { fecha: filtros.fecha } : {}),
      ...(filtros.estado ? { estado: filtros.estado } : {}),
      ...(filtros.doctor ? { doctor: filtros.doctor } : {}),
      ...(filtros.paciente ? { paciente: filtros.paciente } : {}),
    };

    const response = await api.get("/cita", { params });
    return response.data;
  },

  async obtenerUno(id: number): Promise<Cita> {
    const response = await api.get(`/cita/${id}`);
    return response.data;
  },

  async obtenerHorariosDisponibles(
    idDoctor: number,
    fecha: string,
  ): Promise<HorariosDisponibles> {
    const response = await api.get("/cita/horarios-disponibles", {
      params: { idDoctor, fecha },
    });
    return response.data;
  },

  async crear(datos: CrearCitaDto) {
    const response = await api.post("/cita", datos);
    return response.data;
  },

  async actualizar(id: number, datos: ActualizarCitaDto) {
    const response = await api.patch(`/cita/${id}`, datos);
    return response.data;
  },

  async eliminar(id: number) {
    const response = await api.delete(`/cita/${id}`);
    return response.data;
  },
};
