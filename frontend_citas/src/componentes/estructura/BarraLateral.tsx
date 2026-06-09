import { Link, useLocation, useNavigate } from "react-router-dom";
import {FaHome,FaUsers,FaUserInjured,FaUserMd,FaStethoscope,FaDoorOpen,FaClock,FaCalendarCheck,FaHeartbeat,FaFileMedical,FaHistory,FaUserCircle,FaSignOutAlt} from "react-icons/fa";
import { authService } from "../../servicios/auth.service";
import { cerrarSesion, obtenerRol } from "../../utilidades/jwt";

export default function BarraLateral() {
  const location = useLocation();
  const navigate = useNavigate();
  const rol = obtenerRol();

  const menusAdmin = [
    {
      nombre: "Dashboard",
      ruta: "/dashboard",
      icono: <FaHome />,
    },
    {
      nombre: "Usuarios",
      ruta: "/dashboard/usuarios",
      icono: <FaUsers />,
    },
    {
      nombre: "Pacientes",
      ruta: "/dashboard/pacientes",
      icono: <FaUserInjured />,
    },
    {
      nombre: "Doctores",
      ruta: "/dashboard/doctores",
      icono: <FaUserMd />,
    },
    {
      nombre: "Especialidades",
      ruta: "/dashboard/especialidades-admin",
      icono: <FaStethoscope />,
    },
    {
      nombre: "Consultorios",
      ruta: "/dashboard/consultorios",
      icono: <FaDoorOpen />,
    },
    {
      nombre: "Horarios",
      ruta: "/dashboard/horarios",
      icono: <FaClock />,
    },
    {
      nombre: "Citas",
      ruta: "/dashboard/citas",
      icono: <FaCalendarCheck />,
    },
    {
      nombre: "Signos Vitales",
      ruta: "/dashboard/signos-vitales",
      icono: <FaHeartbeat />,
    },
    {
      nombre: "Historias Clinicas",
      ruta: "/dashboard/historias-clinicas",
      icono: <FaFileMedical />,
    },
    {
      nombre: "Logs",
      ruta: "/dashboard/logs",
      icono: <FaHistory />,
    },
    {
      nombre: "Perfil",
      ruta: "/dashboard/perfil",
      icono: <FaUserCircle />,
    },
  ];

  const menusDoctor = [
    {
      nombre: "Dashboard",
      ruta: "/dashboard",
      icono: <FaHome />,
    },
    {
      nombre: "Mis Citas",
      ruta: "/dashboard/mis-citas",
      icono: <FaCalendarCheck />,
    },
    {
      nombre: "Pacientes",
      ruta: "/dashboard/doctor/pacientes",
      icono: <FaUsers />,
    },
    {
      nombre: "Signos Vitales",
      ruta: "/dashboard/doctor/signos-vitales",
      icono: <FaHeartbeat />,
    },
    {
      nombre: "Historias Clinicas",
      ruta: "/dashboard/doctor/historias-clinicas",
      icono: <FaFileMedical />,
    },
    {
      nombre: "Perfil",
      ruta: "/dashboard/perfil",
      icono: <FaUserCircle />,
    },
  ];

  const menusPaciente = [
    {
      nombre: "Dashboard",
      ruta: "/dashboard",
      icono: <FaHome />,
    },
    {
      nombre: "Mis Citas",
      ruta: "/dashboard/paciente/mis-citas",
      icono: <FaCalendarCheck />,
    },
    {
      nombre: "Mis Signos Vitales",
      ruta: "/dashboard/paciente/signos-vitales",
      icono: <FaHeartbeat />,
    },
    {
      nombre: "Mis Historias Clinicas",
      ruta: "/dashboard/paciente/historias-clinicas",
      icono: <FaFileMedical />,
    },
    {
      nombre: "Perfil",
      ruta: "/dashboard/perfil",
      icono: <FaUserCircle />,
    },
  ];

  const menus =
    rol === "DOCTOR"
      ? menusDoctor
      : rol === "PACIENTE"
        ? menusPaciente
        : menusAdmin;

  async function cerrarSesionPortal() {
    try {
      await authService.logout();
    } catch (error) {
      console.error(error);
      alert("No fue posible cerrar sesion.");
    } finally {
      cerrarSesion();
      navigate("/login");
    }
  }

  return (
    <aside className=" w-72 bg-[#0F4C9A] text-white min-h-screen p-6 ">
      <h2 className="text-2xl font-bold mb-8">NUEVA ESPERANZA</h2>
      <nav className="space-y-2">
        {menus.map((menu) => (
          <Link
            key={menu.ruta}
            to={menu.ruta}
            className={` flex items-center gap-3 px-4 py-3 rounded-xl transition
              ${location.pathname === menu.ruta ? "bg-cyan-500" : "hover:bg-blue-800"}`}
          >
            {menu.icono}
            {menu.nombre}
          </Link>
        ))}
      </nav>

      {(rol === "DOCTOR" || rol === "PACIENTE") && (
        <button
          onClick={cerrarSesionPortal}
          className="mt-6 w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 transition"
        >
          <FaSignOutAlt />
          Cerrar Sesion
        </button>
      )}
    </aside>
  );
}
