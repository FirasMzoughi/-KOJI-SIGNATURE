import { Navbar } from "@/components/layout/Navbar";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden md:flex md:flex-shrink-0">
          {/* Sidebar content (optional) */}
        </aside>
        <main className="flex-1 overflow-y-auto focus:outline-none p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
