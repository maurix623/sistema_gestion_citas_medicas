import LayoutPublico from "../../componentes/estructura/LayoutPublico";
import heroMedico from "../../activos/hero-medico.png";
import {FaCalendarCheck,FaUserDoctor,FaFileMedical,FaClock} from "react-icons/fa6";
import TarjetaCaracteristica from "../../componentes/comunes/TarjetaCaracteristica";
import PasoProceso from "../../componentes/comunes/PasoProceso";
import TarjetaEspecialidad from "../../componentes/comunes/TarjetaEspecialidad";
import { FaPhone, FaLocationDot, FaEnvelope } from "react-icons/fa6";
import { Link } from "react-router-dom";

export default function Inicio() {
  return (
    <LayoutPublico>
      <section className="bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Contenido */}
            <div>
              <span className=" inline-block bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full font-medium " >
                Sistema Integral de Gestión Médica
              </span>

              <h1 className=" mt-6 text-5xl font-bold text-slate-800 leading-tight " >
                Atención médica de calidad para ti y tu familia
              </h1>

              <p className=" mt-6 text-lg text-slate-600 leading-relaxed " >
                Agenda tus citas médicas de forma rápida y segura. Accede a tu
                historial clínico, consulta tus reservas y mantén el seguimiento
                de tu atención desde cualquier lugar.
              </p>

              <div className="flex flex-wrap gap-4 mt-8">
                <Link to="/login" className=" bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-xl font-semibold transition " >
                  Agendar Cita
                </Link>
              </div>
            </div>

            {/* Imagen */}
            <div>
              <img src={heroMedico} alt="Consulta médica" className=" w-full h-165           object-cover   rounded-3xl shadow-xl" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-800">
              ¿Por qué elegir Nueva Esperanza?
            </h2>

            <p className="mt-4 text-slate-600">
              Tecnología y atención médica unidas para brindar una experiencia
              más eficiente a pacientes y profesionales.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <TarjetaCaracteristica icono={<FaCalendarCheck />} titulo="Reserva Online" descripcion="Agenda tus citas médicas de forma rápida y sencilla." />
            <TarjetaCaracteristica icono={<FaUserDoctor />} titulo="Especialistas" descripcion="Profesionales capacitados en diversas áreas médicas." />
            <TarjetaCaracteristica icono={<FaFileMedical />} titulo="Historia Clínica" descripcion="Información médica segura y siempre disponible." />
            <TarjetaCaracteristica icono={<FaClock />} titulo="Atención Organizada" descripcion="Optimización de horarios y reducción de tiempos de espera." />
          </div>
        </div>
      </section>
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800">
              ¿Cómo funciona?
            </h2>

            <p className="mt-4 text-slate-600">
              Gestiona tu atención médica en pocos pasos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <PasoProceso numero="1" titulo="Regístrate" descripcion="Crea una cuenta para acceder a todos los servicios del consultorio." />
            <PasoProceso numero="2" titulo="Agenda tu cita" descripcion="Selecciona fecha, horario y profesional disponible." />
            <PasoProceso numero="3" titulo="Recibe atención médica" descripcion="Consulta tus citas, historial clínico y seguimiento médico."/>
          </div>
        </div>
      </section>
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-800">
              Nuestras Especialidades
            </h2>

            <p className="mt-4 text-slate-600">
              Profesionales capacitados para cuidar tu salud.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <TarjetaEspecialidad nombre="Medicina General" descripcion="Atención integral para pacientes de todas las edades." />
            <TarjetaEspecialidad nombre="Pediatría" descripcion="Cuidado especializado para niños y adolescentes." />
            <TarjetaEspecialidad nombre="Cardiología" descripcion="Prevención y tratamiento de enfermedades cardíacas." />
            <TarjetaEspecialidad nombre="Traumatología" descripcion="Diagnóstico y tratamiento de lesiones musculares y óseas." />
          </div>
        </div>
      </section>
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-slate-800">
              Información de Contacto
            </h2>

            <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
              Estamos comprometidos con brindar atención médica accesible,
              segura y de calidad para todos nuestros pacientes.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">

            {/* Información */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex gap-4 items-start">
                  <FaPhone className="text-cyan-500 mt-1" size={22} />

                  <div>
                    <h3 className="font-semibold text-slate-800">Teléfono</h3>
                    <p className="text-slate-600">+591 62550069</p>
                  </div>

                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex gap-4 items-start">
                  <FaEnvelope className="text-cyan-500 mt-1" size={22} />

                  <div>
                    <h3 className="font-semibold text-slate-800">
                      Correo Electrónico
                    </h3>

                    <p className="text-slate-600">
                      ivanmauricio060203@gmail.com
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex gap-4 items-start">
                  <FaLocationDot className="text-cyan-500 mt-1" size={22} />

                  <div>
                    <h3 className="font-semibold text-slate-800">Dirección</h3>

                    <p className="text-slate-600">
                      Av. Bolivia #156, Calle G  # 156
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex gap-4 items-start">
                  <FaClock className="text-cyan-500 mt-1" size={22} />

                  <div>
                    <h3 className="font-semibold text-slate-800">
                      Horario de Atención
                    </h3>

                    <p className="text-slate-600">Lunes a Viernes</p>

                    <p className="text-slate-600">08:00 - 20:00</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Panel institucional */}

            <div className=" bg-gradient-to-br from-[#0F4C9A] to-[#14B8C4] rounded-3xl p-10 text-white flex flex-col justify-center ">
              <h3 className="text-3xl font-bold mb-6">NUEVA ESPERANZA</h3>

              <p className="text-lg leading-relaxed opacity-95">
                Nuestro objetivo es ofrecer una experiencia médica moderna
                mediante la gestión eficiente de citas, historiales clínicos
                digitales y atención profesional centrada en el bienestar de
                nuestros pacientes.
              </p>

              <div className="mt-8">
                <Link to="/login" className=" inline-block bg-white text-[#0F4C9A] font-semibold px-6 py-3 rounded-xl hover:scale-105 transition " >
                  Iniciar Sesión
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </LayoutPublico>
  );
}
