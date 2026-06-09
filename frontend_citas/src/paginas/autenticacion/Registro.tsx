import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CampoTexto from "../../componentes/formularios/CampoTexto";
import CampoPassword from "../../componentes/formularios/CampoPassword";
import logo from "../../activos/logo.png";
import { authService } from "../../servicios/auth.service";

const REGLAS = {
  correo: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  telefono: /^[0-9]{7,15}$/,
  password:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/,
  soloLetras: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/,
};

function validarCampos(campos: {
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  password: string;
  confirmarPassword: string;
}) {
  const errores = {
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    password: "",
    confirmarPassword: "",
  };

  if (!campos.nombre.trim()) {
    errores.nombre = "El nombre es obligatorio.";
  } else if (campos.nombre.trim().length < 2) {
    errores.nombre = "El nombre debe tener al menos 2 caracteres.";
  } else if (!REGLAS.soloLetras.test(campos.nombre)) {
    errores.nombre = "El nombre solo puede contener letras.";
  }

  if (!campos.apellido.trim()) {
    errores.apellido = "El apellido es obligatorio.";
  } else if (campos.apellido.trim().length < 2) {
    errores.apellido = "El apellido debe tener al menos 2 caracteres.";
  } else if (!REGLAS.soloLetras.test(campos.apellido)) {
    errores.apellido = "El apellido solo puede contener letras.";
  }

  if (!campos.correo.trim()) {
    errores.correo = "El correo electrónico es obligatorio.";
  } else if (!REGLAS.correo.test(campos.correo)) {
    errores.correo = "Ingrese un correo válido (ej: nombre@dominio.com).";
  } else if (campos.correo.length > 100) {
    errores.correo = "El correo no puede superar los 100 caracteres.";
  }

  if (!campos.telefono.trim()) {
    errores.telefono = "El teléfono es obligatorio.";
  } else if (!REGLAS.telefono.test(campos.telefono)) {
    errores.telefono =
      "Ingrese un teléfono válido (solo números, 7 a 15 dígitos).";
  }

  if (!campos.password) {
    errores.password = "La contraseña es obligatoria.";
  } else if (!REGLAS.password.test(campos.password)) {
    errores.password = "La contraseña no cumple los requisitos de seguridad.";
  }

  if (!campos.confirmarPassword) {
    errores.confirmarPassword = "Debe confirmar la contraseña.";
  } else if (campos.password !== campos.confirmarPassword) {
    errores.confirmarPassword = "Las contraseñas no coinciden.";
  }

  const esValido = Object.values(errores).every((e) => e === "");
  return { errores, esValido };
}

function calcularFortaleza(password: string) {
  let puntos = 0;
  if (password.length >= 8) puntos++;
  if (/[A-Z]/.test(password)) puntos++;
  if (/[a-z]/.test(password)) puntos++;
  if (/\d/.test(password)) puntos++;
  if (/[^A-Za-z0-9]/.test(password)) puntos++;

  if (puntos <= 2)
    return { texto: "Débil", color: "bg-red-500", ancho: "w-1/3" };
  if (puntos <= 4)
    return { texto: "Intermedia", color: "bg-yellow-500", ancho: "w-2/3" };
  return { texto: "Fuerte", color: "bg-green-500", ancho: "w-full" };
}

export default function Registro() {
  const navigate = useNavigate();

  const [campos, setCampos] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    password: "",
    confirmarPassword: "",
  });

  const [errores, setErrores] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    password: "",
    confirmarPassword: "",
  });

  const [errorRegistro, setErrorRegistro] = useState("");
  const [cargando, setCargando] = useState(false);

  const fortaleza = useMemo(
    () => calcularFortaleza(campos.password),
    [campos.password],
  );

  function actualizarCampo(campo: keyof typeof campos, valor: string) {
    const nuevosCampos = { ...campos, [campo]: valor };
    setCampos(nuevosCampos);

    if (errores[campo]) {
      const { errores: nuevosErrores } = validarCampos(nuevosCampos);
      setErrores((prev) => ({ ...prev, [campo]: nuevosErrores[campo] }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorRegistro("");

    const { errores: nuevosErrores, esValido } = validarCampos(campos);
    setErrores(nuevosErrores);

    if (!esValido) return;

    try {
      setCargando(true);
      const respuesta = await authService.register({
        nombre: campos.nombre,
        apellido: campos.apellido,
        correo: campos.correo,
        telefono: campos.telefono,
        password: campos.password,
        id_rol: 2,
      });

      console.log("Usuario creado:", respuesta);
      navigate("/login");
    } catch (error: any) {
      console.error(error);

      const mensajeBackend = error?.response?.data?.message;

      setErrorRegistro(
        Array.isArray(mensajeBackend)
          ? mensajeBackend.join(", ")
          : mensajeBackend ||
              "Ocurrió un error al registrarse. Intente nuevamente.",
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-lg p-8">
        {/* Encabezado */}
        <div className="text-center mb-8">
          <img src={logo} alt="Nueva Esperanza" className="h-20 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-[#0F4C9A]">NUEVA ESPERANZA</h1>
          <p className="text-slate-600 mt-2">Crear nueva cuenta</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <CampoTexto etiqueta="Nombre" valor={campos.nombre} onChange={(v) => actualizarCampo("nombre", v)} placeholder="Ingrese su nombre" error={errores.nombre}/>
          <CampoTexto etiqueta="Apellido" valor={campos.apellido} onChange={(v) => actualizarCampo("apellido", v)} placeholder="Ingrese su apellido" error={errores.apellido}/>
          <CampoTexto etiqueta="Correo Electrónico" valor={campos.correo} onChange={(v) => actualizarCampo("correo", v.toLowerCase().trim())} tipo="email" placeholder="correo@ejemplo.com" error={errores.correo}/>
          <CampoTexto etiqueta="Teléfono" valor={campos.telefono} onChange={(v) => actualizarCampo("telefono", v.replace(/\D/g, ""))} placeholder="Ingrese su teléfono" error={errores.telefono}/>

          <div>
            <CampoPassword etiqueta="Contraseña" valor={campos.password} onChange={(v) => actualizarCampo("password", v)} placeholder="Ingrese una contraseña" error={errores.password}/>
            <p className="text-xs text-slate-500 mt-1">
              Mínimo 8 caracteres, una mayúscula, una minúscula, un número y un
              carácter especial.
            </p>
          </div>

          {/* Barra de fortaleza */}
          {campos.password && (
            <div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className={`h-full transition-all ${fortaleza.color} ${fortaleza.ancho}`}/>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Fortaleza:{" "}
                <span className="font-medium">{fortaleza.texto}</span>
              </p>
            </div>
          )}
          
          <CampoPassword etiqueta="Confirmar Contraseña" valor={campos.confirmarPassword} onChange={(v) => actualizarCampo("confirmarPassword", v)} placeholder="Repita la contraseña" error={errores.confirmarPassword}/>
          {/* Error general del servidor */}
          {errorRegistro && (
            <div className="bg-red-50 border border-red-300 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
              {errorRegistro}
            </div>
          )}

          <button type="submit" disabled={cargando} className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition">
            {cargando ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <p className="text-center mt-6 text-slate-600">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-cyan-600 font-semibold">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
