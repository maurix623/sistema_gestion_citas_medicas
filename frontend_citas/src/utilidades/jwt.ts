import { jwtDecode } from "jwt-decode";

interface PayloadToken {
  sub: number;
  correo: string;
  rol: string;
  iat: number;
  exp: number;
}

export function obtenerToken() {
  return localStorage.getItem("token");
}

export function obtenerUsuarioToken(): PayloadToken | null {
  const token = obtenerToken();

  if (!token) return null;

  try {
    return jwtDecode<PayloadToken>(token);
  } catch {
    return null;
  }
}

export function obtenerRol() {
  return obtenerUsuarioToken()?.rol;
}

export function obtenerCorreo() {
  return obtenerUsuarioToken()?.correo;
}

export function obtenerIdUsuario() {
  return obtenerUsuarioToken()?.sub;
}

export function cerrarSesion() {
  localStorage.removeItem("token");
}
