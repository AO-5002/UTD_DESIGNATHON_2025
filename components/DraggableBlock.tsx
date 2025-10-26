"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type DraggableBlockProps = {
  id: string;
  initialX?: number;
  initialY?: number;
  children?: React.ReactNode;
  className?: string;
  onPositionChange?: (id: string, x: number, y: number) => void;
};

export function DraggableBlock({
  id,
  initialX = 0,
  initialY = 0,
  children,
  className = "",
  onPositionChange,
}: DraggableBlockProps) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });

  return (
    <motion.div
      data-draggable="true"
      drag
      dragMomentum={false}
      dragElastic={0}
      style={{
        x: position.x,
        y: position.y,
        position: "absolute",
        touchAction: "none",
      }}
      onDragEnd={(event, info) => {
        const newX = position.x + info.offset.x;
        const newY = position.y + info.offset.y;
        setPosition({ x: newX, y: newY });
        onPositionChange?.(id, newX, newY);
      }}
      className={`cursor-move ${className}`}
    >
      {children}
    </motion.div>
  );
}

// Pre-built block types for common use cases

type TextBlockProps = {
  id: string;
  initialX?: number;
  initialY?: number;
  content?: string;
  onPositionChange?: (id: string, x: number, y: number) => void;
};

export function TextBlock({
  id,
  initialX = 0,
  initialY = 0,
  content = "Text Block",
  onPositionChange,
}: TextBlockProps) {
  return (
    <DraggableBlock
      id={id}
      initialX={initialX}
      initialY={initialY}
      onPositionChange={onPositionChange}
    >
      <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-md min-w-[200px] hover:shadow-lg transition-shadow">
        <p className="text-sm">{content}</p>
      </div>
    </DraggableBlock>
  );
}

type CardBlockProps = {
  id: string;
  initialX?: number;
  initialY?: number;
  title?: string;
  description?: string;
  color?: string;
  onPositionChange?: (id: string, x: number, y: number) => void;
};

export function CardBlock({
  id,
  initialX = 0,
  initialY = 0,
  title = "Card Title",
  description = "Card description goes here",
  color = "#bacded",
  onPositionChange,
}: CardBlockProps) {
  return (
    <DraggableBlock
      id={id}
      initialX={initialX}
      initialY={initialY}
      onPositionChange={onPositionChange}
    >
      <div
        className="rounded-2xl border-2 border-black p-6 shadow-lg min-w-[250px] hover:shadow-xl transition-all"
        style={{ backgroundColor: color }}
      >
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <p className="text-sm opacity-80">{description}</p>
      </div>
    </DraggableBlock>
  );
}

type StickyNoteProps = {
  id: string;
  initialX?: number;
  initialY?: number;
  content?: string;
  color?: string;
  onPositionChange?: (id: string, x: number, y: number) => void;
};

export function StickyNote({
  id,
  initialX = 0,
  initialY = 0,
  content = "Sticky note",
  color = "#ffd7d7",
  onPositionChange,
}: StickyNoteProps) {
  return (
    <DraggableBlock
      id={id}
      initialX={initialX}
      initialY={initialY}
      onPositionChange={onPositionChange}
    >
      <div
        className="rounded-lg p-4 shadow-md w-[200px] h-[200px] hover:shadow-lg transition-shadow"
        style={{ backgroundColor: color }}
      >
        <p className="text-sm font-medium">{content}</p>
      </div>
    </DraggableBlock>
  );
}
