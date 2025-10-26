"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useRef, useEffect } from "react";

export type SoundBlock = {
  id: string;
  label: string;
  sound: string; // URL or path to sound file
  color: string;
  icon?: React.ReactNode;
};

type MenuClickBtnProps = {
  icon: React.ReactNode;
  label: string;
  soundBlocks: SoundBlock[];
  className?: string;
  isActive?: boolean;
};

export function MenuClickBtn({
  icon,
  label,
  soundBlocks,
  className = "",
  isActive = false,
}: MenuClickBtnProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const playSound = (soundUrl: string) => {
    const audio = new Audio(soundUrl);
    audio.play().catch((error) => {
      console.error("Error playing sound:", error);
      console.log(`Could not load sound file: ${soundUrl}`);
      console.log("Make sure the sound file exists in your public folder");
    });
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 ${
          isOpen || isActive
            ? "bg-gradient-to-br from-[#FFB5B5] to-[#FFCACA] text-[#FF8B8B] shadow-md"
            : "hover:bg-gray-100 text-gray-700 hover:text-black"
        } ${className}`}
      >
        {icon}
      </button>

      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-fit whitespace-nowrap rounded-md border border-[var(--color-border)] bg-white px-3 py-1.5 text-sm text-black shadow-lg z-50"
            role="tooltip"
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3x3 Sound Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.9, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-white rounded-xl border-2 border-[var(--color-border)] shadow-xl p-4 z-50"
          >
            <div className="grid grid-cols-3 gap-3">
              {soundBlocks.slice(0, 9).map((block) => (
                <motion.button
                  key={block.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    playSound(block.sound);
                  }}
                  className="w-20 h-20 rounded-xl border-2 border-gray-300 flex flex-col items-center justify-center gap-1.5 transition-all hover:shadow-lg active:border-gray-500 cursor-pointer"
                  style={{ backgroundColor: block.color }}
                  title={block.label}
                >
                  {block.icon && (
                    <div className="text-gray-700">{block.icon}</div>
                  )}
                  <span className="text-[10px] font-medium text-gray-700 text-center leading-tight px-1">
                    {block.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
