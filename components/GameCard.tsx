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
    <motion.button
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative w-full h-64 rounded-2xl border-2 border-gray-300 shadow-lg overflow-hidden group cursor-pointer transition-all hover:shadow-2xl"
      style={{ backgroundColor: color }}
    >
      {/* Shadow layer for depth */}
      <div
        className="absolute inset-0 translate-x-1 translate-y-1 rounded-2xl -z-10"
        style={{ backgroundColor: color, filter: "brightness(0.85)" }}
      />

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center p-6 text-center gap-4">
        {/* Icon */}
        <div className="text-gray-700 group-hover:scale-110 transition-transform">
          {icon}
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-gray-900">{title}</h3>

        {/* Description */}
        <p className="text-sm text-gray-700 opacity-80">{description}</p>

        {/* Play button indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/10 rounded-full text-xs font-medium text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity">
          Click to Play
        </div>
      </div>
    </motion.button>
  );
}
