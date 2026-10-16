"use client";

import { useEffect, useState } from "react";

const CELL = 60;

export default function GridBackground() {
  const [tiles, setTiles] = useState<
    { col: number; row: number; opacity: number }[]
  >([]);

  useEffect(() => {
    setTiles(
      Array.from({ length: 22 }, () => ({
        col: Math.floor(Math.random() * 16),
        row: Math.floor(Math.random() * 28),
        opacity: 0.04 + Math.random() * 0.08,
      })),
    );
  }, []);

  const fade =
    "radial-gradient(ellipse at 50% 40%, black 35%, transparent 85%)";

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ maskImage: fade, WebkitMaskImage: fade }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.3) 1px, transparent 1px)`,
          backgroundSize: `${CELL}px ${CELL}px`,
        }}
      />
      {tiles.map((t, i) => (
        <div
          key={i}
          className="absolute bg-white"
          style={{
            left: t.col * CELL,
            top: t.row * CELL,
            width: CELL,
            height: CELL,
            opacity: t.opacity,
          }}
        />
      ))}
    </div>
  );
}
