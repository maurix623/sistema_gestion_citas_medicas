import type { ReactNode } from "react";
import BarraNavegacion from "./BarraNavegacion";
import PiePagina from "./PiePagina";

interface Props {
  children: ReactNode;
}

export default function LayoutPublico({ children }: Props) {
  return (
    <div className="min-h-screen flex flex-col">
      <BarraNavegacion />
      <main className="flex-1">{children}</main>
      <PiePagina />
    </div>
  );
}
