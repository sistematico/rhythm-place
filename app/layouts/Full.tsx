export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm md:max-w-lg lg:max-w-xl bg-black/50 border-3 border-black/80 p-8 rounded-lg shadow-lg text-center">
        {children}
      </div>
    </div>
  );
}