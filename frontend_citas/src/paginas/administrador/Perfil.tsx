import { useEffect, useState } from "react";
import LayoutPortal from "../../componentes/estructura/LayoutPortal";
import { authService } from "../../servicios/auth.service";
import { obtenerMensajeError } from "../../utilidades/apiErrores";

interface PerfilAuth {
  sub: number;
  correo: string;
  rol: string;
}

export default function Perfil() {
  const [perfil, setPerfil] = useState<PerfilAuth | null>(null);
  const [cargando, setCargando] = useState(true);

  async function cargarPerfil() {
    try {
      const data = await authService.obtenerPerfil();
      setPerfil(data);
    } 
    catch (error) {
      console.error(error);
      alert(obtenerMensajeError(error, "No fue posible cargar el perfil."));
    } 
    finally {setCargando(false);}
  }

  useEffect(() => {cargarPerfil();}, []);

  return (
    <LayoutPortal>
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-cyan-600">Perfil</h1>
        </div>

        {cargando ? ( <p>Cargando perfil...</p>) : perfil ? 
        (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-slate-200 rounded-2xl p-5">
              <p className="text-sm text-slate-500 mb-1">ID de usuario</p>
              <p className="text-lg font-semibold text-slate-800">
                {perfil.sub}
              </p>
            </div>

            <div className="border border-slate-200 rounded-2xl p-5">
              <p className="text-sm text-slate-500 mb-1">Correo</p>
              <p className="text-lg font-semibold text-slate-800">
                {perfil.correo}
              </p>
            </div>

            <div className="border border-slate-200 rounded-2xl p-5">
              <p className="text-sm text-slate-500 mb-1">Rol</p>
              <p className="text-lg font-semibold text-slate-800">
                {perfil.rol}
              </p>
            </div>
          </div>
        ) :  (<p>No se encontro informacion del perfil.</p>)
        }
      </div>
    </LayoutPortal>
  );
}
