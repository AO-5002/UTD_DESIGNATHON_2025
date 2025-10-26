"use client";

import { motion } from "framer-motion";

type GameCardProps = {
  title: string;
  description: string;
  color: string;
  icon: React.ReactNode;
  onClick: () => void;
};

export function GameCard({
  title,
  description,
  color,
  icon,
  onClick,
}: GameCardProps) {
  return (
    <div className="relative">
      {/* Shadow layer */}
      <div
        className="absolute inset-0 rounded-[50px] translate-x-3 translate-y-3"
        style={{ backgroundColor: "black" }}
      />

      {/* Main card */}
      <motion.button
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="relative w-full h-80 rounded-[50px] border-2 border-black overflow-hidden cursor-pointer transition-all"
        style={{ backgroundColor: color }}
      >
        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center p-8 text-center gap-6">
          {/* Icon */}
          <div className="text-black">{icon}</div>

          {/* Title */}
          <h3 className="text-3xl font-black text-black">{title}</h3>

          {/* Description */}
          <p className="text-base font-medium text-black/80">{description}</p>

          {/* Play button */}
          <div className="mt-4 px-8 py-3 bg-black text-white rounded-full text-sm font-bold hover:scale-105 transition-transform">
            Click to Play
          </div>
        </div>
      </motion.button>
    </div>
  );
}
