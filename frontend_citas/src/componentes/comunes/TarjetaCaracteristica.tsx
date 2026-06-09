import type { ReactNode } from "react";

interface Props {
  icono: ReactNode;
  titulo: string;
  descripcion: string;
}

export default function TarjetaCaracteristica({icono,titulo,descripcion,}: Props) {
  return (
    <div className=" bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition ">
      <div className="text-cyan-500 text-4xl mb-4">{icono}</div>
      <h3 className="text-xl font-semibold text-slate-800 mb-3">{titulo}</h3>
      <p className="text-slate-600">{descripcion}</p>
    </div>
  );
}
