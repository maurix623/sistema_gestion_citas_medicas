import { api } from "./api";

export interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  rol: {
    id_rol: number;
    nombre_rol: string;
  };
}

export interface CrearUsuarioDto {
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  password: string;
  id_rol: number;
}

export interface ActualizarUsuarioDto {
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  id_rol: number;
  password?: string;
}

export const usuarioService = {
  async obtenerTodos(): Promise<Usuario[]> {
    const response = await api.get("/usuario");
    return response.data;
  },

  async obtenerUno(id: number): Promise<Usuario> {
    const response = await api.get(`/usuario/${id}`);
    return response.data;
  },

  async crear(datos: CrearUsuarioDto) {
    const response = await api.post("/usuario", datos);
    return response.data;
  },

  async actualizar(id: number, datos: ActualizarUsuarioDto) {
    const response = await api.patch(`/usuario/${id}`, datos);
    return response.data;
  },

  async eliminar(id: number) {
    const response = await api.delete(`/usuario/${id}`);
    return response.data;
  },
};
