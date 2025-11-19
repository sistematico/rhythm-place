"use client";

import { useAudio } from "@/context/AudioContext";
import { Play, Pause } from "lucide-react";

export default function AudioPlayer() {
  const { play, pause, playing } = useAudio();
  return (
    <>
      {playing ? <button onClick={pause}><Pause /></button> : <button onClick={play}><Play /></button>}
    </>
  );
}
