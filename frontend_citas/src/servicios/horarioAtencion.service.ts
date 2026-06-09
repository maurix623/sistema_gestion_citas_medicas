import { api } from "./api";
import type { Doctor } from "./doctor.service";

export type DiaSemana =
  | "LUNES"
  | "MARTES"
  | "MIERCOLES"
  | "JUEVES"
  | "VIERNES"
  | "SABADO"
  | "DOMINGO";

export interface HorarioAtencion {
  id_horario: number;
  dia_semana: DiaSemana;
  hora_inicio: string;
  hora_fin: string;
  duracion_cita_minutos: number;
  doctor: Doctor;
  creadoEn?: string;
  actualizadoEn?: string;
  eliminadoEn?: string | null;
}

export interface CrearHorarioAtencionDto {
  id_doctor: number;
  dia_semana: DiaSemana;
  hora_inicio: string;
  hora_fin: string;
  duracion_cita_minutos: number;
}

export interface ActualizarHorarioAtencionDto {
  id_doctor?: number;
  dia_semana?: DiaSemana;
  hora_inicio?: string;
  hora_fin?: string;
  duracion_cita_minutos?: number;
}

export const horarioAtencionService = {
  async obtenerTodos(): Promise<HorarioAtencion[]> {
    const response = await api.get("/horario_atencion");
    return response.data;
  },

  async obtenerUno(id: number): Promise<HorarioAtencion> {
    const response = await api.get(`/horario_atencion/${id}`);
    return response.data;
  },

  async crear(datos: CrearHorarioAtencionDto) {
    const response = await api.post("/horario_atencion", datos);
    return response.data;
  },

  async actualizar(id: number, datos: ActualizarHorarioAtencionDto) {
    const response = await api.patch(`/horario_atencion/${id}`, datos);
    return response.data;
  },

  async eliminar(id: number) {
    const response = await api.delete(`/horario_atencion/${id}`);
    return response.data;
  },
};
