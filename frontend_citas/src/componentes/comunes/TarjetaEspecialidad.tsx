interface Props {
  nombre: string;
  descripcion: string;
}

export default function TarjetaEspecialidad({ nombre, descripcion }: Props) {
  return (
    <div className=" bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition " >
      <h3 className="text-xl font-semibold text-[#0F4C9A] mb-3">{nombre}</h3>
      <p className="text-slate-600">{descripcion}</p>
    </div>
  );
}
