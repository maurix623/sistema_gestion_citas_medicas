import { useEffect, useState } from "react";
import { usuarioService } from "../../servicios/usuario.service";
import type {ActualizarUsuarioDto,CrearUsuarioDto,Usuario} from "../../servicios/usuario.service";
import LayoutPortal from "../../componentes/estructura/LayoutPortal";
import { obtenerMensajeError } from "../../utilidades/apiErrores";

const REGLAS = {
  soloLetras: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/,
  correo: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  telefono: /^[0-9]{7,15}$/,
  password:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/,
};

const USUARIO_VACIO = {
  nombre: "",
  apellido: "",
  correo: "",
  telefono: "",
  password: "",
  id_rol: 2,
};

const ERRORES_VACIOS = {
  nombre: "",
  apellido: "",
  correo: "",
  telefono: "",
  password: "",
};

function validarUsuario(u: typeof USUARIO_VACIO, modoEdicion = false) {
  const errores = { ...ERRORES_VACIOS };

  if (!u.nombre.trim()) errores.nombre = "El nombre es obligatorio.";
  else if (u.nombre.trim().length < 2) errores.nombre = "Mínimo 2 caracteres.";
  else if (!REGLAS.soloLetras.test(u.nombre))
    errores.nombre = "Solo se permiten letras.";

  if (!u.apellido.trim()) errores.apellido = "El apellido es obligatorio.";
  else if (u.apellido.trim().length < 2)
    errores.apellido = "Mínimo 2 caracteres.";
  else if (!REGLAS.soloLetras.test(u.apellido))
    errores.apellido = "Solo se permiten letras.";

  if (!u.correo.trim()) errores.correo = "El correo es obligatorio.";
  else if (!REGLAS.correo.test(u.correo))
    errores.correo = "Ingrese un correo válido (ej: nombre@dominio.com).";

  if (!u.telefono.trim()) errores.telefono = "El teléfono es obligatorio.";
  else if (!REGLAS.telefono.test(u.telefono))
    errores.telefono = "Solo números, entre 7 y 15 dígitos.";

  if (!modoEdicion) {
    if (!u.password) errores.password = "La contraseña es obligatoria.";
    else if (!REGLAS.password.test(u.password))
      errores.password =
        "Mínimo 8 caracteres, mayúscula, minúscula, número y símbolo.";
  } 
  else {
    if (u.password && !REGLAS.password.test(u.password))
      errores.password = "La contraseña no cumple los requisitos.";
  }

  const esValido = Object.values(errores).every((e) => e === "");
  return { errores, esValido };
}

function Campo({ etiqueta, error, children,}: {
  etiqueta: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {etiqueta}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

const claseInput = (error: string) =>
  `w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${error ? "border-red-400 bg-red-50" : "border-slate-300"}`;

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [nuevoUsuario, setNuevoUsuario] = useState(USUARIO_VACIO);
  const [errores, setErrores] = useState(ERRORES_VACIOS);
  const [verPassword, setVerPassword] = useState(false);

  function actualizarCampo(campo: keyof typeof ERRORES_VACIOS, valor: string) {
    const actualizado = { ...nuevoUsuario, [campo]: valor };
    setNuevoUsuario(actualizado);

    if (errores[campo]) {
      const { errores: nuevos } = validarUsuario(actualizado, modoEdicion);
      setErrores((prev) => ({ ...prev, [campo]: nuevos[campo] }));
    }
  }

  function cerrarModal() {
    setMostrarModal(false);
    setModoEdicion(false);
    setUsuarioEditando(null);
    setNuevoUsuario(USUARIO_VACIO);
    setErrores(ERRORES_VACIOS);
    setVerPassword(false);
  }

  function abrirEditar(usuario: Usuario) {
    setModoEdicion(true);
    setUsuarioEditando(usuario);
    setNuevoUsuario({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      telefono: usuario.telefono,
      password: "",
      id_rol: usuario.rol.id_rol,
    });
    setMostrarModal(true);
  }

  async function cargarUsuarios() {
    try {
      const data = await usuarioService.obtenerTodos();
      setUsuarios(data);
    } 
    catch (error) {console.error(error);} 
    finally {setCargando(false);}
  }

  async function eliminarUsuario(id: number) {
    if (!window.confirm("¿Desea eliminar este usuario?")) return;
    try {
      await usuarioService.eliminar(id);
      cargarUsuarios();
    } 
    catch (error) {
      console.error(error);
      alert(obtenerMensajeError(error, "No fue posible eliminar el usuario."));
    }
  }

  async function guardarUsuario() {
    const { errores: nuevosErrores, esValido } = validarUsuario( nuevoUsuario, modoEdicion );
    setErrores(nuevosErrores);
    if (!esValido) return;

    try {
      setGuardando(true);

      if (modoEdicion && usuarioEditando) {
        const datosEdicion: ActualizarUsuarioDto = {
          nombre: nuevoUsuario.nombre,
          apellido: nuevoUsuario.apellido,
          correo: nuevoUsuario.correo,
          telefono: nuevoUsuario.telefono,
          id_rol: nuevoUsuario.id_rol,
          ...(nuevoUsuario.password.trim() ? { password: nuevoUsuario.password } : {}),
        };
        await usuarioService.actualizar(
          usuarioEditando.id_usuario,
          datosEdicion,
        );
      } 
      else {
        const datosCreacion: CrearUsuarioDto = {
          nombre: nuevoUsuario.nombre,
          apellido: nuevoUsuario.apellido,
          correo: nuevoUsuario.correo,
          telefono: nuevoUsuario.telefono,
          password: nuevoUsuario.password,
          id_rol: nuevoUsuario.id_rol,
        };
        await usuarioService.crear(datosCreacion);
      }

      cerrarModal();
      cargarUsuarios();
    } 
    catch (error) {
      console.error(error);
      alert(obtenerMensajeError( error, modoEdicion   ? "No fue posible actualizar el usuario."   : "No fue posible crear el usuario.", ));
    } 
    finally {setGuardando(false);}
  }

  useEffect(() => {cargarUsuarios();}, []);

  const usuariosFiltrados = usuarios.filter((u) =>`${u.nombre} ${u.apellido} ${u.correo}`
      .toLowerCase()
      .includes(busqueda.toLowerCase()),
  );

  return (
    <LayoutPortal>
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-cyan-600">
              Gestión de Usuarios
            </h1>

            <input type="text" placeholder="Buscar usuario..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="border border-slate-300 rounded-xl px-4 py-3 w-80 focus:outline-none focus:ring-2 focus:ring-cyan-500" />

            <button onClick={() => setMostrarModal(true)} className="bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-3 rounded-xl font-semibold" >
              Nuevo Usuario
            </button>
          </div>

          {cargando ? (<p>Cargando usuarios...</p>) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3">Nombre</th>
                    <th className="text-left py-3">Correo</th>
                    <th className="text-left py-3">Teléfono</th>
                    <th className="text-left py-3">Rol</th>
                    <th className="text-left py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map((usuario) => (
                    <tr key={usuario.id_usuario} className="border-b">
                      <td className="py-3">
                        {usuario.nombre} {usuario.apellido}
                      </td>
                      <td>{usuario.correo}</td>
                      <td>{usuario.telefono}</td>
                      <td>{usuario.rol.nombre_rol}</td>
                      <td className="space-x-2 py-3">
                        <button
                        onClick={() => abrirEditar(usuario)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => eliminarUsuario(usuario.id_usuario)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-6">
              {modoEdicion ? "Editar Usuario" : "Nuevo Usuario"}
            </h2>

            <div className="space-y-4">
              <Campo etiqueta="Nombre" error={errores.nombre}>
                <input type="text" placeholder="Ingrese el nombre" value={nuevoUsuario.nombre} maxLength={100}
                  onChange={(e) => actualizarCampo("nombre", e.target.value)}
                  className={claseInput(errores.nombre)}
                />
              </Campo>

              <Campo etiqueta="Apellido" error={errores.apellido}>
                <input type="text" placeholder="Ingrese el apellido" value={nuevoUsuario.apellido} maxLength={100}
                  onChange={(e) => actualizarCampo("apellido", e.target.value)}
                  className={claseInput(errores.apellido)}
                />
              </Campo>

              <Campo etiqueta="Correo electrónico" error={errores.correo}>
                <input type="email" placeholder="correo@ejemplo.com" value={nuevoUsuario.correo} maxLength={150}
                  onChange={(e) =>
                    actualizarCampo(
                      "correo",
                      e.target.value.toLowerCase().trim(),
                    )
                  }
                  className={claseInput(errores.correo)}
                />
              </Campo>

              <Campo etiqueta="Teléfono" error={errores.telefono}>
                <input type="text" placeholder="Solo números (7 a 15 dígitos)" value={nuevoUsuario.telefono} maxLength={15}
                  onChange={(e) =>
                    actualizarCampo(
                      "telefono",
                      e.target.value.replace(/\D/g, ""),
                    )
                  }
                  className={claseInput(errores.telefono)}
                />
              </Campo>

              <Campo
                etiqueta={
                  modoEdicion ? "Nueva Contraseña (opcional)" : "Contraseña"
                }
                error={errores.password}
              >
                <div className="relative">
                  <input type={verPassword ? "text" : "password"} placeholder="Mínimo 8 caracteres, mayúscula, número y símbolo" value={nuevoUsuario.password} maxLength={255}
                    onChange={(e) =>
                      actualizarCampo("password", e.target.value)
                    }
                    className={claseInput(errores.password)}
                  />
                  <button
                    type="button"
                    onClick={() => setVerPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {verPassword ? (
                      // Ojito cerrado
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                      </svg>
                    ) : (
                      // Ojito abierto
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    )}
                  </button>
                </div>
              </Campo>

              {modoEdicion && (
                <p className="text-xs text-slate-500 -mt-2">
                  Deje este campo vacío si no desea cambiar la contraseña.
                </p>
              )}

              <Campo etiqueta="Rol">
                <select
                  value={nuevoUsuario.id_rol}
                  onChange={(e) =>
                    setNuevoUsuario({
                      ...nuevoUsuario,
                      id_rol: Number(e.target.value),
                    })
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value={1}>Admin</option>
                  <option value={2}>Paciente</option>
                  <option value={3}>Doctor</option>
                </select>
              </Campo>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={cerrarModal} className="bg-slate-200 hover:bg-slate-300 px-5 py-3 rounded-xl font-medium" >
                Cancelar
              </button>
              <button onClick={guardarUsuario} disabled={guardando} className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-60 text-white px-5 py-3 rounded-xl font-semibold" >
                {guardando ? "Guardando..." : modoEdicion   ? "Actualizar"   : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </LayoutPortal>
  );
}
