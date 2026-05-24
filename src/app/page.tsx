import Image from "next/image";
import { RadioPlayer } from "@/components/radio-player";

export default function Home() {
  return (
    <main className="space-scene relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-10 text-white">
      <div className="starfield starfield-near" aria-hidden="true" />
      <div className="starfield starfield-mid" aria-hidden="true" />
      <div className="starfield starfield-far" aria-hidden="true" />

      <div className="relative z-10 flex w-full max-w-4xl items-center justify-center">
        <div className="w-full rounded-[2rem] border border-white/12 bg-white/8 px-6 py-8 text-center shadow-[0_30px_100px_rgba(2,6,23,0.55)] backdrop-blur-xl sm:px-10 sm:py-10">
          <div className="mx-auto flex w-fit items-center justify-center rounded-full border border-white/15 bg-white/10 p-5 shadow-[0_0_60px_rgba(148,163,184,0.18)]">
            <Image
              src="/images/astronaut.svg"
              alt="Astronauta flutuando no espaco"
              width={112}
              height={112}
              className="h-24 w-24 drop-shadow-[0_10px_30px_rgba(255,255,255,0.18)] sm:h-28 sm:w-28"
            />
          </div>

          <div className="mt-8 space-y-3">
            <h1 className="mx-auto max-w-[8ch] text-balance text-[clamp(2.9rem,8vw,4.9rem)] font-semibold leading-[0.92] tracking-[0.1em] text-white">
              Rhythm Place
            </h1>
            <div className="mx-auto h-px w-28 bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          </div>

          <div className="mt-8">
            <RadioPlayer />
          </div>
        </div>
      </div>
    </main>
  );
}
