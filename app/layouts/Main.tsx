export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky z-50 bg-gray-300 top-0 p-4">
        header contents
      </header>
      <main className="grow">
        {children}
      </main>
      <footer className="sticky z-50 bg-gray-300 bottom-0 p-4">
        footer contents
      </footer>
    </div>
  );
}