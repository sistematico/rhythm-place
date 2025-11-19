import Header from "./Header";
import Footer from "./Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto">
        <Header />
      </div>
      <div className="grow">
        <main className="container mx-auto">{children}</main>
      </div>
      <div className="container mx-auto">
        <Footer />
      </div>
    </div>
  );
}
