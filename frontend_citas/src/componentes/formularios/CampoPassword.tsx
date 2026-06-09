import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface CampoPasswordProps {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  error?: string;
  placeholder?: string;
}

export default function CampoPassword({
  etiqueta,
  valor,
  onChange,
  error,
  placeholder,
}: CampoPasswordProps) {
  const [mostrar, setMostrar] = useState(false);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        {etiqueta}
      </label>

      <div className="relative">
        <input
          type={mostrar ? "text" : "password"}
          value={valor}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={` w-full rounded-xl border px-4 py-3 pr-12 outline-none transition
                      ${
                        error
                          ? "border-red-500"
                          : "border-slate-300 focus:border-cyan-500"
                      }
                    `}
        />

        <button type="button" onClick={() => setMostrar(!mostrar)} className=" absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" >
          {mostrar ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
