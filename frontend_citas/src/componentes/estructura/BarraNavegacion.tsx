import { Link } from "react-router-dom";
import logo from "../../activos/logo.png";

export default function BarraNavegacion() {
  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-24">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-4">
            <img src={logo} alt="Nueva Esperanza" className="h-16 w-auto" />
            <div>
              <h1 className="text-2xl font-bold text-[#0F4C9A]">
                NUEVA ESPERANZA
              </h1>
              <p className="text-slate-500 text-sm">Consultorio Médico</p>
            </div>
          </Link>

          {/* Menú */}
          <nav className="flex items-center gap-8">
            <Link to="/" className="text-slate-700 hover:text-[#14B8C4] transition" >
              Inicio
            </Link>

            <Link to="/especialistas" className="text-slate-700 hover:text-[#14B8C4] transition" >
              Especialidades y Horarios
            </Link>

            <Link to="/login" className=" bg-[#0F4C9A] hover:bg-[#0B3D7A] text-white px-5 py-3 rounded-xl font-medium transition " >
              Iniciar Sesión
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
