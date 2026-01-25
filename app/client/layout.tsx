

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="hidden md:flex md:flex-shrink-0">
    
      </aside>
      <main className="flex-1 overflow-y-auto focus:outline-none p-8">
        {children}
      </main>
    </div>
  );
}
