import Image from "next/image";
import Player from "./components/Player";
import { config } from "./config";

export default function Home() {
  return (
    <div>
      <Image 
        className="rounded-full border-3 border-black/80"
        src="/logo.png" 
        alt="Rhythm Place" 
        width={200} 
        height={200} 
        loading="eager"
      />
      <h1>Rhythm Place</h1>
      <Player source={config.streamUrl} />
    </div>
  );
}
