import { Routes, Route } from "react-router-dom";

import Inicio from "../paginas/publicas/Inicio";
import Login from "../paginas/autenticacion/Login";
import Registro from "../paginas/autenticacion/Registro";
import Dashboard from "../paginas/administrador/Dashboard";
import DashboardDoctor from "../paginas/doctor/DashboardDoctor";
import DashboardPaciente from "../paginas/paciente/DashboardPaciente";
import RutaProtegida from "./RutaProtegida";
import Usuarios from "../paginas/administrador/Usuarios";
import Especialidades from "../paginas/administrador/Especialidades";
import Consultorios from "../paginas/administrador/Consultorios";
import Doctores from "../paginas/administrador/Doctores";
import Pacientes from "../paginas/administrador/Pacientes";
import Horarios from "../paginas/administrador/Horarios";
import Citas from "../paginas/administrador/Citas";
import SignosVitales from "../paginas/administrador/SignosVitales";
import HistoriasClinicas from "../paginas/administrador/HistoriasClinicas";
import LogsAcceso from "../paginas/administrador/LogsAcceso";
import Perfil from "../paginas/administrador/Perfil";
import MisCitasDoctor from "../paginas/doctor/MisCitas";
import SignosVitalesDoctor from "../paginas/doctor/SignosVitales";
import HistoriasClinicasDoctor from "../paginas/doctor/HistoriasClinicas";
import MisCitasPaciente from "../paginas/paciente/MisCitasPaciente";
import MiHistoriaClinica from "../paginas/paciente/MiHistoriaClinica";
import MisSignosVitalesPaciente from "../paginas/paciente/MisSignosVitales";
import { obtenerRol } from "../utilidades/jwt";
import GestionPacientesDoctor from "../paginas/doctor/Pacientes";
import Especialistas from "../paginas/publicas/Especialistas";

function DashboardPorRol() {
  const rol = obtenerRol();
  if (rol === "DOCTOR") return <DashboardDoctor />;
  if (rol === "PACIENTE") return <DashboardPaciente />;
  return <Dashboard />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/login" element={<Login />} />
      <Route path="/especialistas" element={<Especialistas/>} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/dashboard"element={<RutaProtegida><DashboardPorRol /></RutaProtegida>}/>
      <Route path="/dashboard/usuarios" element={<RutaProtegida rolesPermitidos={["ADMIN"]}><Usuarios /></RutaProtegida>} />
      <Route path="/dashboard/especialidades-admin" element={<RutaProtegida rolesPermitidos={["ADMIN"]}><Especialidades /></RutaProtegida>} />
      <Route path="/dashboard/consultorios" element={<RutaProtegida rolesPermitidos={["ADMIN"]}><Consultorios /></RutaProtegida>} />
      <Route path="/dashboard/doctores" element={<RutaProtegida rolesPermitidos={["ADMIN"]}><Doctores /></RutaProtegida>} />
      <Route path="/dashboard/pacientes" element={<RutaProtegida rolesPermitidos={["ADMIN"]}><Pacientes /></RutaProtegida>} />
      <Route path="/dashboard/horarios" element={<RutaProtegida rolesPermitidos={["ADMIN"]}><Horarios /></RutaProtegida>} />
      <Route path="/dashboard/citas" element={<RutaProtegida rolesPermitidos={["ADMIN"]}><Citas /></RutaProtegida>} />
      <Route path="/dashboard/signos-vitales" element={<RutaProtegida rolesPermitidos={["ADMIN"]}><SignosVitales /></RutaProtegida>} />
      <Route path="/dashboard/historias-clinicas" element={<RutaProtegida rolesPermitidos={["ADMIN"]}><HistoriasClinicas /></RutaProtegida>} />
      <Route path="/dashboard/logs" element={<RutaProtegida rolesPermitidos={["ADMIN"]}><LogsAcceso /></RutaProtegida>} />
      <Route path="/dashboard/perfil" element={<RutaProtegida><Perfil /></RutaProtegida>} />
      <Route path="/dashboard/mis-citas" element={<RutaProtegida rolesPermitidos={["DOCTOR"]}><MisCitasDoctor /></RutaProtegida>} />
      <Route path="/dashboard/doctor/pacientes"element={<RutaProtegida rolesPermitidos={["DOCTOR"]}><GestionPacientesDoctor /></RutaProtegida>}/>
      <Route path="/dashboard/doctor/signos-vitales" element={<RutaProtegida rolesPermitidos={["DOCTOR"]}><SignosVitalesDoctor /></RutaProtegida>} />
      <Route path="/dashboard/doctor/historias-clinicas" element={<RutaProtegida rolesPermitidos={["DOCTOR"]}><HistoriasClinicasDoctor /></RutaProtegida>} />
      <Route path="/dashboard/paciente/mis-citas" element={<RutaProtegida rolesPermitidos={["PACIENTE"]}><MisCitasPaciente /></RutaProtegida>} />
      <Route path="/dashboard/paciente/signos-vitales" element={<RutaProtegida rolesPermitidos={["PACIENTE"]}><MisSignosVitalesPaciente /></RutaProtegida>} />
      <Route path="/dashboard/paciente/historias-clinicas" element={<RutaProtegida rolesPermitidos={["PACIENTE"]}><MiHistoriaClinica /></RutaProtegida>} />
    </Routes>
  );
}
