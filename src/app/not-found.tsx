import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="container mx-auto bg-black/50 p-8 rounded-xl">
        <Image 
          src="/images/logo.svg" 
          className="h-92 w-auto mx-auto mb-4"
          alt="Not Found" 
          width={400} 
          height={400} 
        />
        <Link href="/">Voltar para a página inicial</Link>
        <h2>Página Não Encontrada</h2>
        <p>A página que você está procurando não existe.</p>
      </div>
    </div>
  );
}
