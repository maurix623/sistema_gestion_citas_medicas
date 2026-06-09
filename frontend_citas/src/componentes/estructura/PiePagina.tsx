import { FaPhoneAlt, FaFacebookF, FaInstagram } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { FaLocationDot } from "react-icons/fa6";

export default function PiePagina() {
  return (
    <footer className="bg-slate-950 text-white mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-10">
          <div>
            <h2 className="text-2xl font-bold">NUEVA ESPERANZA</h2>
            <p className="mt-4 text-slate-300">
              Atención médica de calidad, brindando confianza, profesionalismo y
              bienestar para nuestros pacientes.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces rápidos</h3>
            <ul className="space-y-3 text-slate-300">
              <li>
                <a href="#" className="hover:text-teal-400 transition">
                  Inicio
                </a>
              </li>

              <li>
                <a href="#" className="hover:text-teal-400 transition">
                  Especialidades y Horarios
                </a>
              </li> 

              <li>
                <a href="#" className="hover:text-teal-400 transition">
                  Iniciar Sesión
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">
              Información de contacto
            </h3>

            <div className="space-y-4 text-slate-300">
              <div className="flex items-center gap-3">
                <FaPhoneAlt className="text-teal-400" />
                <span>+591 62550069</span>
              </div>

              <div className="flex items-center gap-3">
                <FaLocationDot className="text-teal-400" />
                <span>Av. Bolivia #156, Calle G  # 156</span>
              </div>

              <div className="flex items-center gap-3">
                <MdEmail className="text-teal-400 text-xl" />
                <span>ivanmauricio060203@gmail.com</span>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button className="bg-slate-800 p-3 rounded-full hover:bg-teal-500 transition">
                <FaFacebookF />
              </button>

              <button className="bg-slate-800 p-3 rounded-full hover:bg-teal-500 transition">
                <FaInstagram />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 text-center text-slate-400 text-sm">
          © 2026 NUEVA ESPERANZA · Sistema de Gestión de Citas Médicas
        </div>
      </div>
    </footer>
  );
}
