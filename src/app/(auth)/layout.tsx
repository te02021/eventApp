import { Card } from "@/components/ui/card"; // Ajusta la ruta si es necesario
import { Calendar } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-linear-to-b from-primary/5 via-background to-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* --- SECCIÓN DE MARCA (LOGO) --- */}
        <div className="mb-8 text-center">
          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Calendar className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">EventApp</h1>
          <p className="text-muted-foreground mt-1">
            Organiza tu vida, simplifica tus eventos
          </p>
        </div>

        {/* --- CONTENEDOR DE LA TARJETA --- */}
        {/* El Layout pone la Card, las páginas ponen el contenido dentro */}
        <Card className="w-full max-w-sm border-0 shadow-xl">{children}</Card>

        {/* --- FOOTER --- */}
        <p className="text-xs text-muted-foreground mt-8 text-center">
          Al continuar, aceptas nuestros términos de servicio y política de
          privacidad
        </p>
      </div>
    </div>
  );
}
