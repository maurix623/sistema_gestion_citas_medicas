import { api } from "./api";

interface LoginDto {
  correo: string;
  password: string;
}

interface RegisterDto {
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  password: string;
  id_rol: number;
}

export const authService = {
  async login(datos: LoginDto) {
    const response = await api.post("/auth/login", datos);
    return response.data;
  },

  async obtenerPerfil() {
    const response = await api.get("/auth/perfil");
    return response.data;
  },

  async register(datos: RegisterDto) {
    const response = await api.post("/usuario", datos);
    return response.data;
  },

  async logout() {
    const response = await api.post("/auth/logout");

    return response.data;
  },
};
