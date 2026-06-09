import { api } from "./api";

export interface Consultorio {
  id_consultorio: number;
  nombre: string;
  ubicacion?: string | null;
  descripcion?: string | null;
  creadoEn?: string;
  actualizadoEn?: string;
  eliminadoEn?: string | null;
}

export interface CrearConsultorioDto {
  nombre: string;
  ubicacion?: string;
  descripcion?: string;
}

export interface ActualizarConsultorioDto {
  nombre?: string;
  ubicacion?: string;
  descripcion?: string;
}

export const consultorioService = {
  async obtenerTodos(): Promise<Consultorio[]> {
    const response = await api.get("/consultorio");
    return response.data;
  },

  async obtenerUno(id: number): Promise<Consultorio> {
    const response = await api.get(`/consultorio/${id}`);
    return response.data;
  },

  async crear(datos: CrearConsultorioDto) {
    const response = await api.post("/consultorio", datos);
    return response.data;
  },

  async actualizar(id: number, datos: ActualizarConsultorioDto) {
    const response = await api.patch(`/consultorio/${id}`, datos);
    return response.data;
  },

  async eliminar(id: number) {
    const response = await api.delete(`/consultorio/${id}`);
    return response.data;
  },
};
