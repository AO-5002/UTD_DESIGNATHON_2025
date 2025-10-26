"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useState, useRef, useEffect } from "react";

type ConnectionSide = "top" | "right" | "bottom" | "left";

type PuzzlePieceProps = {
  id: string;
  initialX?: number;
  initialY?: number;
  color?: string;
  text?: string;
  onPositionChange?: (id: string, x: number, y: number) => void;
  onTextChange?: (id: string, text: string) => void;
  onConnect?: (
    piece1Id: string,
    piece2Id: string,
    side: ConnectionSide
  ) => void;
  allPieces?: Map<string, { x: number; y: number; ref: HTMLDivElement | null }>;
};

const PIECE_SIZE = 120;
const SNAP_DISTANCE = 30;

export function PuzzlePiece({
  id,
  initialX = 0,
  initialY = 0,
  color = "#bacded",
  text = "",
  onPositionChange,
  onTextChange,
  onConnect,
  allPieces = new Map(),
}: PuzzlePieceProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [pieceText, setPieceText] = useState(text);
  const [currentX, setCurrentX] = useState(initialX);
  const [currentY, setCurrentY] = useState(initialY);
  const pieceRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const x = useMotionValue(initialX);
  const y = useMotionValue(initialY);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  // Register this piece's position
  useEffect(() => {
    if (pieceRef.current) {
      allPieces.set(id, { x: currentX, y: currentY, ref: pieceRef.current });
    }
    return () => {
      allPieces.delete(id);
    };
  }, [id, currentX, currentY, allPieces]);

  const findSnapPosition = (dragX: number, dragY: number) => {
    let snapX = dragX;
    let snapY = dragY;
    let snapped = false;

    // Check all other pieces for snap points
    for (const [otherId, otherPiece] of allPieces.entries()) {
      if (otherId === id) continue;

      const otherX = otherPiece.x;
      const otherY = otherPiece.y;

      // Check right side connection
      const rightDiff = Math.abs(dragX - (otherX + PIECE_SIZE));
      const rightYDiff = Math.abs(dragY - otherY);
      if (rightDiff < SNAP_DISTANCE && rightYDiff < SNAP_DISTANCE) {
        snapX = otherX + PIECE_SIZE;
        snapY = otherY;
        snapped = true;
        onConnect?.(id, otherId, "right");
      }

      // Check left side connection
      const leftDiff = Math.abs(dragX - (otherX - PIECE_SIZE));
      const leftYDiff = Math.abs(dragY - otherY);
      if (leftDiff < SNAP_DISTANCE && leftYDiff < SNAP_DISTANCE) {
        snapX = otherX - PIECE_SIZE;
        snapY = otherY;
        snapped = true;
        onConnect?.(id, otherId, "left");
      }

      // Check bottom side connection
      const bottomDiff = Math.abs(dragY - (otherY + PIECE_SIZE));
      const bottomXDiff = Math.abs(dragX - otherX);
      if (bottomDiff < SNAP_DISTANCE && bottomXDiff < SNAP_DISTANCE) {
        snapY = otherY + PIECE_SIZE;
        snapX = otherX;
        snapped = true;
        onConnect?.(id, otherId, "bottom");
      }

      // Check top side connection
      const topDiff = Math.abs(dragY - (otherY - PIECE_SIZE));
      const topXDiff = Math.abs(dragX - otherX);
      if (topDiff < SNAP_DISTANCE && topXDiff < SNAP_DISTANCE) {
        snapY = otherY - PIECE_SIZE;
        snapX = otherX;
        snapped = true;
        onConnect?.(id, otherId, "top");
      }

      if (snapped) break;
    }

    return { x: snapX, y: snapY, snapped };
  };

  const handleTextSave = () => {
    setIsEditing(false);
    onTextChange?.(id, pieceText);
  };

  return (
    <motion.div
      ref={pieceRef}
      data-draggable="true"
      drag
      dragMomentum={false}
      dragElastic={0}
      style={{
        x,
        y,
        width: PIECE_SIZE,
        height: PIECE_SIZE,
      }}
      initial={{ x: initialX, y: initialY }}
      onDrag={(event, info) => {
        const newX = initialX + info.offset.x;
        const newY = initialY + info.offset.y;
        x.set(newX);
        y.set(newY);
      }}
      onDragEnd={(event, info) => {
        const dragX = initialX + info.offset.x;
        const dragY = initialY + info.offset.y;

        const { x: snapX, y: snapY, snapped } = findSnapPosition(dragX, dragY);

        setCurrentX(snapX);
        setCurrentY(snapY);
        x.set(snapX);
        y.set(snapY);
        onPositionChange?.(id, snapX, snapY);
      }}
      className="absolute cursor-move select-none"
      whileHover={{ scale: 1.05 }}
      whileDrag={{ scale: 1.1, cursor: "grabbing", zIndex: 50 }}
    >
      {/* Puzzle Piece SVG Shape */}
      <svg
        width={PIECE_SIZE}
        height={PIECE_SIZE}
        viewBox="0 0 120 120"
        className="absolute inset-0 drop-shadow-lg"
      >
        {/* Main puzzle piece shape with connectors */}
        <path
          d="M 10 10 
             L 50 10 
             Q 55 5, 60 10 
             Q 65 15, 60 20 
             Q 55 25, 50 20 
             L 10 20 
             L 10 50 
             Q 5 55, 10 60 
             Q 15 65, 20 60 
             Q 25 55, 20 50 
             L 20 10 
             Z
             
             M 60 10
             L 110 10
             L 110 60
             Q 115 65, 110 70
             Q 105 75, 100 70
             Q 95 65, 100 60
             L 100 10
             Z
             
             M 10 60
             L 10 110
             L 60 110
             Q 65 115, 70 110
             Q 75 105, 70 100
             Q 65 95, 60 100
             L 10 100
             Z
             
             M 60 60
             L 110 60
             L 110 110
             L 60 110
             Z"
          fill={color}
          stroke="#2d3748"
          strokeWidth="2"
          className="transition-colors"
        />
      </svg>

      {/* Text content area */}
      <div
        className="absolute inset-0 flex items-center justify-center p-4"
        onClick={(e) => {
          e.stopPropagation();
          if (!isEditing) setIsEditing(true);
        }}
      >
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={pieceText}
            onChange={(e) => setPieceText(e.target.value)}
            onBlur={handleTextSave}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleTextSave();
              }
              if (e.key === "Escape") {
                setPieceText(text);
                setIsEditing(false);
              }
            }}
            className="w-full h-16 bg-transparent text-center text-xs font-medium resize-none outline-none border-none focus:ring-0"
            style={{ color: "#2d3748" }}
            maxLength={50}
            placeholder="Click to add text..."
          />
        ) : (
          <p className="text-xs font-medium text-gray-800 text-center break-words w-full px-2">
            {pieceText || "Click to edit"}
          </p>
        )}
      </div>
    </motion.div>
  );
}
