import { api } from "./api";
import type { Cita } from "./cita.service";

export interface SignoVital {
  id_signo: number;
  peso?: number | string | null;
  altura?: number | string | null;
  temperatura?: number | string | null;
  presion_arterial?: string | null;
  frecuencia_cardiaca?: number | null;
  saturacion_oxigeno?: number | string | null;
  cita: Cita;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface CrearSignoVitalDto {
  id_cita: number;
  peso?: number;
  altura?: number;
  temperatura?: number;
  presion_arterial?: string;
  frecuencia_cardiaca?: number;
  saturacion_oxigeno?: number;
}

export interface ActualizarSignoVitalDto {
  peso?: number;
  altura?: number;
  temperatura?: number;
  presion_arterial?: string;
  frecuencia_cardiaca?: number;
  saturacion_oxigeno?: number;
}

export const signoVitalService = {
  async obtenerTodos(): Promise<SignoVital[]> {
    const response = await api.get("/signo_vital");
    return response.data;
  },

  async obtenerUno(id: number): Promise<SignoVital> {
    const response = await api.get(`/signo_vital/${id}`);
    return response.data;
  },

  async crear(datos: CrearSignoVitalDto) {
    const response = await api.post("/signo_vital", datos);
    return response.data;
  },

  async actualizar(id: number, datos: ActualizarSignoVitalDto) {
    const response = await api.patch(`/signo_vital/${id}`, datos);
    return response.data;
  },
};
