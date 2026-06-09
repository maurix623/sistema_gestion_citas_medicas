import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CampoTexto from "../../componentes/formularios/CampoTexto";
import CampoPassword from "../../componentes/formularios/CampoPassword";
import logo from "../../activos/logo.png";
import { authService } from "../../servicios/auth.service";

export default function Login() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaA] = useState(() => Math.floor(Math.random() * 10) + 1);
  const [captchaB] = useState(() => Math.floor(Math.random() * 10) + 1);
  const [cargando, setCargando] = useState(false);
  const [errores, setErrores] = useState({correo: "",password: "",captcha: "",login: "",});

  const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validarFormulario = (): boolean => {
    const nuevosErrores = { correo: "", password: "", captcha: "", login: "" };
    let valido = true;

    if (!correo.trim()) {
      nuevosErrores.correo = "El correo electrónico es obligatorio";
      valido = false;
    } else if (!REGEX_CORREO.test(correo)) {
      nuevosErrores.correo = "Ingrese un correo electrónico válido";
      valido = false;
    }

    if (!password.trim()) {
      nuevosErrores.password = "La contraseña es obligatoria";
      valido = false;
    } else if (password.length < 6) {
      nuevosErrores.password = "La contraseña debe tener al menos 6 caracteres";
      valido = false;
    }

    if (Number(captcha) !== captchaA + captchaB) {
      nuevosErrores.captcha = "CAPTCHA incorrecto";
      valido = false;
    }

    setErrores(nuevosErrores);
    return valido;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    try {
      setCargando(true);
      const respuesta = await authService.login({ correo, password });
      localStorage.setItem("token", respuesta.access_token);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setErrores((prev) => ({
        ...prev,
        login: "Credenciales inválidas. Verifique su correo y contraseña.",
      }));
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">
        <div className="text-center mb-8">
          <img src={logo} alt="Nueva Esperanza" className="h-20 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-[#0F4C9A]">NUEVA ESPERANZA</h1>
          <p className="text-slate-600 mt-2">Bienvenido nuevamente</p>
        </div>

        <form noValidate onSubmit={handleSubmit} className="space-y-5">
          <CampoTexto etiqueta="Correo electrónico" valor={correo} onChange={setCorreo} placeholder="correo@ejemplo.com" tipo="email" error={errores.correo}/>

          <CampoPassword etiqueta="Contraseña" valor={password} onChange={setPassword} placeholder="Ingrese su contraseña" error={errores.password}/>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              CAPTCHA
            </label>
            <div className="flex items-center gap-3">
              <span className="bg-slate-100 px-4 py-3 rounded-xl font-semibold">
                {captchaA} + {captchaB}
              </span>
              <input type="number" value={captcha} onChange={(e) => setCaptcha(e.target.value)} className="flex-1 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Resultado"/>
            </div>
            {errores.captcha && (
              <p className="text-sm text-red-500">{errores.captcha}</p>
            )}
          </div>

          {errores.login && (
            <div className="bg-red-50 border border-red-300 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
              {errores.login}
            </div>
          )}

          <button type="submit" disabled={cargando} className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed">
            {cargando ? "Ingresando..." : "Iniciar Sesión"}
          </button>
        </form>

        <p className="text-center mt-6 text-slate-600">
          ¿No tienes cuenta?{" "}
          <Link to="/registro" className="text-cyan-600 font-semibold hover:text-cyan-700">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}