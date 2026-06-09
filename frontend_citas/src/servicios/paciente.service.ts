import { api } from "./api";
import type { Usuario } from "./usuario.service";

export interface Paciente {
  id_paciente: number;
  tipo_sangre?: string | null;
  alergias?: string | null;
  fecha_nacimiento?: string | null;
  sexo?: string | null;
  usuario: Usuario;
  creadoEn?: string;
  actualizadoEn?: string;
  eliminadoEn?: string | null;
}

export interface CrearPacienteDto {
  id_usuario: number;
  tipo_sangre?: string;
  alergias?: string;
  fecha_nacimiento?: string;
  sexo?: string;
}

export interface ActualizarPacienteDto {
  id_usuario?: number;
  tipo_sangre?: string;
  alergias?: string;
  fecha_nacimiento?: string;
  sexo?: string;
}

export const pacienteService = {
  async obtenerTodos(): Promise<Paciente[]> {
    const response = await api.get("/paciente");
    return response.data;
  },

  async obtenerUno(id: number): Promise<Paciente> {
    const response = await api.get(`/paciente/${id}`);
    return response.data;
  },

  async crear(datos: CrearPacienteDto) {
    const response = await api.post("/paciente", datos);
    return response.data;
  },

  async actualizar(id: number, datos: ActualizarPacienteDto) {
    const response = await api.patch(`/paciente/${id}`, datos);
    return response.data;
  },

  async eliminar(id: number) {
    const response = await api.delete(`/paciente/${id}`);
    return response.data;
  },
};
