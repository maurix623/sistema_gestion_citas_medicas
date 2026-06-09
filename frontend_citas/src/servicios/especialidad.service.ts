import { api } from "./api";

export interface Especialidad {
  id_especialidad: number;
  nombre: string;
  descripcion?: string | null;
  creadoEn?: string;
  actualizadoEn?: string;
  eliminadoEn?: string | null;
}

export interface CrearEspecialidadDto {
  nombre: string;
  descripcion?: string;
}

export interface ActualizarEspecialidadDto {
  nombre?: string;
  descripcion?: string;
}

export const especialidadService = {
  async obtenerTodos(): Promise<Especialidad[]> {
    const response = await api.get("/especialidad");
    return response.data;
  },

  async obtenerUno(id: number): Promise<Especialidad> {
    const response = await api.get(`/especialidad/${id}`);
    return response.data;
  },

  async crear(datos: CrearEspecialidadDto) {
    const response = await api.post("/especialidad", datos);
    return response.data;
  },

  async actualizar(id: number, datos: ActualizarEspecialidadDto) {
    const response = await api.patch(`/especialidad/${id}`, datos);
    return response.data;
  },

  async eliminar(id: number) {
    const response = await api.delete(`/especialidad/${id}`);
    return response.data;
  },
};
