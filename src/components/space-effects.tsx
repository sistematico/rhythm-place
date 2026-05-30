"use client";

import { useEffect, useRef, useState } from "react";

let uid = 0;
const nextId = () => ++uid;
const rand = (min: number, max: number) => min + Math.random() * (max - min);

interface ShootingStarData {
  id: number;
  /** vw units — starting left */
  x: number;
  /** vh units — starting top */
  y: number;
  /** CSS rotate degrees */
  angle: number;
  /** vw units — travel distance along the rotated axis */
  dist: number;
  /** px — visible trail length */
  length: number;
  duration: number;
}

interface SatelliteData {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  bodyAngle: number;
  duration: number;
  variant: 1 | 2;
}

export function SpaceEffects() {
  const [stars, setStars] = useState<ShootingStarData[]>([]);
  const [satellites, setSatellites] = useState<SatelliteData[]>([]);
  const satTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    function spawn() {
      const duration = rand(380, 680); // always fast
      // Start off the right edge, travel toward lower-left, exit off left/bottom
      const star: ShootingStarData = {
        id: nextId(),
        x: rand(95, 125),   // vw — off right edge
        y: rand(-8, 28),    // vh — upper portion
        angle: rand(148, 168), // rotated so head points lower-left
        dist: rand(150, 175),  // vw — always crosses full screen
        length: rand(110, 210),
        duration,
      };
      setStars((prev) => [...prev, star]);
      setTimeout(
        () => setStars((prev) => prev.filter((s) => s.id !== star.id)),
        duration + 200,
      );
      timer = setTimeout(spawn, rand(2500, 7500));
    }

    timer = setTimeout(spawn, rand(800, 2500));
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    function spawnOne() {
      const fromLeft = Math.random() > 0.45;
      const x = fromLeft ? rand(-9, -6) : rand(18, 78);
      const y = fromLeft ? rand(8, 62) : rand(-9, -6);
      const dx = fromLeft ? rand(108, 118) : rand(4, 18);
      const dy = fromLeft ? rand(2, 12) : rand(108, 118);
      const duration = rand(38000, 62000);
      const bodyAngle = fromLeft ? rand(-6, 7) : rand(82, 96);
      const variant: 1 | 2 = Math.random() > 0.5 ? 1 : 2;
      const sat: SatelliteData = { id: nextId(), x, y, dx, dy, bodyAngle, duration, variant };

      setSatellites((prev) => [...prev, sat]);

      const removeTimer = setTimeout(() => {
        setSatellites((prev) => prev.filter((s) => s.id !== sat.id));
      }, duration + 2500);

      const nextTimer = setTimeout(spawnOne, rand(28000, 58000));
      satTimers.current.push(removeTimer, nextTimer);
    }

    // Launch two independent loops with an offset so they rarely coincide
    const t1 = setTimeout(spawnOne, rand(8000, 18000));
    const t2 = setTimeout(spawnOne, rand(28000, 52000));
    satTimers.current.push(t1, t2);

    return () => {
      for (const t of satTimers.current) clearTimeout(t);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
      {stars.map((star) => (
        <ShootingStar key={star.id} data={star} />
      ))}
      {satellites.map((sat) => (
        <Satellite key={sat.id} data={sat} />
      ))}
    </div>
  );
}

function ShootingStar({ data }: { data: ShootingStarData }) {
  return (
    <div
      style={
        {
          position: "absolute",
          left: `${data.x}vw`,
          top: `${data.y}vh`,
          width: `${data.length}px`,
          height: "1.5px",
          borderRadius: "999px",
          background:
            "linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(186,230,253,0.4) 25%, rgba(255,255,255,0.96) 100%)",
          "--shoot-angle": `${data.angle}deg`,
          "--shoot-dist": `${data.dist}vw`,
          animation: `shoot ${data.duration}ms linear forwards`,
          willChange: "transform, opacity",
        } as React.CSSProperties
      }
    />
  );
}

function Satellite({ data }: { data: SatelliteData }) {
  return (
    <div
      style={
        {
          position: "absolute",
          left: `${data.x}vw`,
          top: `${data.y}vh`,
          "--sat-dx": `${data.dx}vw`,
          "--sat-dy": `${data.dy}vh`,
          "--sat-dur": `${data.duration}ms`,
          animation:
            "satellite-traverse var(--sat-dur) linear forwards, satellite-glow 4s ease-in-out infinite",
          willChange: "transform, filter",
        } as React.CSSProperties
      }
    >
      <div style={{ transform: `rotate(${data.bodyAngle}deg)`, position: "relative" }}>
        {data.variant === 1 ? <SatelliteSvgA /> : <SatelliteSvgB />}
        {data.variant === 1 ? <SignalRings /> : <DishPulse />}
      </div>
    </div>
  );
}

function SatelliteSvgA() {
  return (
    <svg
      width="44"
      height="20"
      viewBox="0 0 44 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Satellite"
      style={{ display: "block" }}
    >
      {/* Left solar panel */}
      <rect x="1" y="7" width="12" height="6" rx="1" fill="#7dd3fc" fillOpacity="0.52" stroke="#bae6fd" strokeWidth="0.6" />
      <line x1="5" y1="7" x2="5" y2="13" stroke="rgba(0,0,0,0.22)" strokeWidth="0.4" />
      <line x1="9" y1="7" x2="9" y2="13" stroke="rgba(0,0,0,0.22)" strokeWidth="0.4" />
      {/* Left strut */}
      <rect x="13" y="9.25" width="3.5" height="1.5" rx="0.4" fill="#e0f2fe" fillOpacity="0.68" />
      {/* Body */}
      <rect x="16.5" y="5.5" width="11" height="9" rx="1.5" fill="#e2e8f0" fillOpacity="0.80" stroke="#f0f9ff" strokeWidth="0.6" />
      {/* Body panel detail */}
      <rect x="18.5" y="7.5" width="7" height="5" rx="0.5" fill="#60a5fa" fillOpacity="0.26" />
      {/* Right strut */}
      <rect x="27.5" y="9.25" width="3.5" height="1.5" rx="0.4" fill="#e0f2fe" fillOpacity="0.68" />
      {/* Right solar panel */}
      <rect x="31" y="7" width="12" height="6" rx="1" fill="#7dd3fc" fillOpacity="0.52" stroke="#bae6fd" strokeWidth="0.6" />
      <line x1="35" y1="7" x2="35" y2="13" stroke="rgba(0,0,0,0.22)" strokeWidth="0.4" />
      <line x1="39" y1="7" x2="39" y2="13" stroke="rgba(0,0,0,0.22)" strokeWidth="0.4" />
      {/* Antenna */}
      <line x1="22" y1="5.5" x2="22" y2="2.5" stroke="#bae6fd" strokeWidth="0.7" strokeOpacity="0.88" />
      <circle cx="22" cy="1.5" r="1.3" fill="#7dd3fc" fillOpacity="0.88" />
    </svg>
  );
}

function SignalRings() {
  return (
    <div
      style={{
        position: "absolute",
        top: "1.5px",
        left: "22px",
        width: 0,
        height: 0,
      }}
    >
      {([0, 1.3, 2.6] as const).map((delay) => (
        <span
          key={delay}
          style={{
            position: "absolute",
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            border: "1px solid rgba(125, 211, 252, 0.65)",
            animation: `signal-ring 3.9s ease-out ${delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Satellite B — compact weather sat with parabolic dish ── */

function SatelliteSvgB() {
  return (
    <svg
      width="38"
      height="34"
      viewBox="0 0 38 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Satellite"
      style={{ display: "block" }}
    >
      {/* Single wide solar panel — left */}
      <rect x="0" y="13" width="14" height="8" rx="1" fill="#fcd34d" fillOpacity="0.42" stroke="#fde68a" strokeWidth="0.5" />
      <line x1="3.5" y1="13" x2="3.5" y2="21" stroke="rgba(0,0,0,0.18)" strokeWidth="0.4" />
      <line x1="7"   y1="13" x2="7"   y2="21" stroke="rgba(0,0,0,0.18)" strokeWidth="0.4" />
      <line x1="10.5" y1="13" x2="10.5" y2="21" stroke="rgba(0,0,0,0.18)" strokeWidth="0.4" />
      {/* Strut */}
      <rect x="14" y="16" width="3" height="2" rx="0.4" fill="#e0f2fe" fillOpacity="0.6" />
      {/* Body — hexagonal feel via clipped rect */}
      <rect x="17" y="11" width="10" height="12" rx="2" fill="#cbd5e1" fillOpacity="0.78" stroke="#f1f5f9" strokeWidth="0.5" />
      <rect x="18.5" y="12.5" width="7" height="4" rx="0.5" fill="#f59e0b" fillOpacity="0.22" />
      <rect x="18.5" y="17.5" width="7" height="2.5" rx="0.5" fill="#60a5fa" fillOpacity="0.22" />
      {/* Right stub — no panel */}
      <rect x="27" y="16" width="4" height="2" rx="0.8" fill="#94a3b8" fillOpacity="0.55" />
      {/* Parabolic dish — arc pointing up-right */}
      <path
        d="M19 11 Q22 4.5 28 6"
        stroke="#fde68a"
        strokeWidth="0.7"
        strokeOpacity="0.9"
        fill="none"
      />
      {/* Dish feed arm */}
      <line x1="22" y1="11" x2="24.5" y2="6.5" stroke="#fde68a" strokeWidth="0.5" strokeOpacity="0.7" />
      {/* Feed point */}
      <circle cx="24.5" cy="6.5" r="1.1" fill="#fcd34d" fillOpacity="0.9" />
    </svg>
  );
}

function DishPulse() {
  return (
    <div
      style={{
        position: "absolute",
        top: "6.5px",
        left: "24.5px",
        width: 0,
        height: 0,
      }}
    >
      {([0, 1.5, 3.0] as const).map((delay) => (
        <span
          key={delay}
          style={{
            position: "absolute",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            border: "1px solid rgba(252, 211, 77, 0.55)",
            animation: `signal-ring 4.4s ease-out ${delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
