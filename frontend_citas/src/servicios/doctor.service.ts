import type { Consultorio } from "./consultorio.service";
import type { Especialidad } from "./especialidad.service";
import { api } from "./api";
import type { Usuario } from "./usuario.service";

export interface Doctor {
  id_doctor: number;
  matricula: string;
  descripcion?: string | null;
  usuario: Usuario;
  especialidad: Especialidad;
  consultorio: Consultorio;
  creadoEn?: string;
  actualizadoEn?: string;
  eliminadoEn?: string | null;
}

export interface CrearDoctorDto {
  id_usuario: number;
  id_especialidad: number;
  id_consultorio: number;
  matricula: string;
  descripcion?: string;
}

export interface ActualizarDoctorDto {
  id_usuario?: number;
  id_especialidad?: number;
  id_consultorio?: number;
  matricula?: string;
  descripcion?: string;
}

export const doctorService = {
  async obtenerTodos(): Promise<Doctor[]> {
    const response = await api.get("/doctor");
    return response.data;
  },

  async obtenerUno(id: number): Promise<Doctor> {
    const response = await api.get(`/doctor/${id}`);
    return response.data;
  },

  async crear(datos: CrearDoctorDto) {
    const response = await api.post("/doctor", datos);
    return response.data;
  },

  async actualizar(id: number, datos: ActualizarDoctorDto) {
    const response = await api.patch(`/doctor/${id}`, datos);
    return response.data;
  },

  async eliminar(id: number) {
    const response = await api.delete(`/doctor/${id}`);
    return response.data;
  },
};
