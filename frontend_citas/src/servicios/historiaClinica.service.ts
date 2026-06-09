import { api } from "./api";
import type { Cita } from "./cita.service";

export interface HistoriaClinica {
  id_historia: number;
  diagnostico: string;
  tratamiento?: string | null;
  notas_medicas?: string | null;
  cita: Cita;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface CrearHistoriaClinicaDto {
  id_cita: number;
  diagnostico: string;
  tratamiento?: string;
  notas_medicas?: string;
}

export interface ActualizarHistoriaClinicaDto {
  diagnostico?: string;
  tratamiento?: string;
  notas_medicas?: string;
}

export const historiaClinicaService = {
  async obtenerTodos(): Promise<HistoriaClinica[]> {
    const response = await api.get("/historia_clinica");
    return response.data;
  },

  async obtenerUno(id: number): Promise<HistoriaClinica> {
    const response = await api.get(`/historia_clinica/${id}`);
    return response.data;
  },

  async crear(datos: CrearHistoriaClinicaDto) {
    const response = await api.post("/historia_clinica", datos);
    return response.data;
  },

  async actualizar(id: number, datos: ActualizarHistoriaClinicaDto) {
    const response = await api.patch(`/historia_clinica/${id}`, datos);
    return response.data;
  },
};
