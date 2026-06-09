import axios from "axios";

export function obtenerMensajeError(
  error: unknown,
  mensajePorDefecto: string,
) {
  if (axios.isAxiosError(error)) {
    const mensaje = error.response?.data?.message;

    if (Array.isArray(mensaje)) {
      return mensaje.join("\n");
    }

    if (typeof mensaje === "string") {
      return mensaje;
    }
  }

  return mensajePorDefecto;
}
