import type { ReactNode } from "react";
import BarraLateral from "./BarraLateral";

interface Props {
  children: ReactNode;
}

export default function LayoutPortal({ children }: Props) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <BarraLateral />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
