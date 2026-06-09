interface Props {numero: string;titulo: string;descripcion: string;}

export default function PasoProceso({ numero, titulo, descripcion }: Props) {
  return (
    <div className="text-center">
      <div className=" w-16 h-16 mx-auto rounded-full bg-cyan-500 text-white text-2xl font-bold flex items-center justify-center mb-4 ">
        {numero}
      </div>
      <h3 className="text-xl font-semibold text-slate-800 mb-3">{titulo}</h3>
      <p className="text-slate-600">{descripcion}</p>
    </div>
  );
}
