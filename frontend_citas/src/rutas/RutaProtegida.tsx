import { Navigate } from "react-router-dom";
import { obtenerRol } from "../utilidades/jwt";

interface Props {
  children: React.ReactNode;
  rolesPermitidos?: string[];
}

export default function RutaProtegida({ children, rolesPermitidos }: Props) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (rolesPermitidos?.length) {
    const rol = obtenerRol();

    if (!rol || !rolesPermitidos.includes(rol)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}
