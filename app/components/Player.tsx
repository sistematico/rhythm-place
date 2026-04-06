"use client";

import { useEffect, useState } from "react";

const json = "https://stream.rhythm.place/json"

export default function Player({ source }: { source: string }) {
  const [title, setTitle] = useState("");

  async function getTitle() {
    const result = await fetch(json)
      .then((res) => res.json())
      .then((data) => data.icestats.source)
      .then((source) => source.title)
      .catch((err) => {
        console.error("Error fetching title:", err);
        return "Unknown Title";
      });
    setTitle(result);
  }

  useEffect(() => {
    // 1. Set up the interval
    const intervalId = setInterval(() => {
      // setCount((prev) => prev + 1);
      getTitle();
    }, 1000);

    // 2. Clean up the interval on unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div>
      <h2>{title}</h2>
      <audio controls>
        <source src={source} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
