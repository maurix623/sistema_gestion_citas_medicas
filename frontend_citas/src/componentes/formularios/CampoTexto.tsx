interface CampoTextoProps {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  tipo?: string;
  error?: string;
  maxLength?: number;
  min?: string | number;
  max?: string | number;
  step?: string | number;
}

export default function CampoTexto({ etiqueta, valor, onChange, placeholder, tipo = "text", error, maxLength, min, max, step}: CampoTextoProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        {etiqueta}
      </label>

      <input
        type={tipo}
        value={valor}
        placeholder={placeholder}
        maxLength={maxLength}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(e.target.value)}
        className={` w-full rounded-xl border px-4 py-3 transition outline-none bg-white
                    ${
                      error
                        ? "border-red-500 focus:border-red-500"
                        : "border-slate-300 focus:border-cyan-500"
                    }
                  `}
      />

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
