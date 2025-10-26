import { motion } from "framer-motion";

type CursorProps = {
  x: number;
  y: number;
  name: string;
  color: string;
};

export function Cursor({ x, y, name, color }: CursorProps) {
  return (
    <motion.div
      className="absolute pointer-events-none z-[9999]"
      style={{
        left: x,
        top: y,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Cursor SVG */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.65376 12.3673L16.9731 21.1l-3.2043-7.874 7.0635-3.1213L5.65376 12.3673z"
          fill={color}
          stroke="white"
          strokeWidth="1.5"
        />
      </svg>

      {/* Name label */}
      <div
        className="absolute top-5 left-5 px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap shadow-lg"
        style={{
          backgroundColor: color,
          color: "white",
        }}
      >
        {name}
      </div>
    </motion.div>
  );
}
