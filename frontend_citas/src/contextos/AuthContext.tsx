import { createContext, useContext, useEffect, useState, type ReactNode} from "react";
import { authService } from "../servicios/auth.service";

interface Usuario {
  id?: number;
  correo: string;
  rol: string;
}
interface AuthContextType {
  usuario: Usuario | null;
  cargando: boolean;
  autenticado: boolean;
  cerrarSesion: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {cargarPerfil();}, []);

  const cargarPerfil = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setCargando(false);
      return;
    }
    try {
      const perfil = await authService.obtenerPerfil();
      setUsuario(perfil);
    } 
    catch (error) {
      console.error(error);
      localStorage.removeItem("token");
    } 
    finally {setCargando(false);}
  };

  const cerrarSesion = () => {localStorage.removeItem("token");
    setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{ usuario, cargando, autenticado: !!usuario, cerrarSesion}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
