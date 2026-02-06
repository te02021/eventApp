import { BottomNav } from "@/components/event-app/bottom-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex justify-center">
      {/* Contenedor tipo Celular (Extraído de event-app.tsx) */}
      <div className="w-full max-w-md h-screen lg:h-[calc(100vh-4rem)] lg:my-8 bg-background shadow-xl relative flex flex-col lg:rounded-3xl lg:border lg:border-border overflow-hidden">
        {/* Aquí se renderizan las páginas (Dashboard, Calendar, etc) */}
        <main className="flex-1 overflow-y-auto scrollbar-hide w-full bg-background">
          {children}
        </main>

        {/* La barra de navegación ahora vive aquí */}
        <div className="shrink-0 z-20 w-full bg-background">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
