import Link from "next/link";
import Image from "next/image";
import AudioPlayer from "@/components/AudioPlayer";
import ThemeSwitch from "@/components/ThemeSwitch";

export default function Header() {
  return (
    <header className="sticky z-50 bg-background top-0 p-4">
      <div className="md:flex justify-center md:justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-3xl">
          <Image
            src="/images/logotipo.svg"
            alt="Rhythm Place"
            width={32}
            height={32}
          />
          Rhythm Place
        </Link>
        <div className="flex items-center gap-2">
          <AudioPlayer />
          <ThemeSwitch />
        </div>
      </div>
    </header>
  );
}
