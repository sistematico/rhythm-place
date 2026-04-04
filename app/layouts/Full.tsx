export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm md:max-w-lg lg:max-w-xl bg-white p-8 rounded-lg shadow-lg text-center">
        {children}
      </div>
    </div>
  );
}