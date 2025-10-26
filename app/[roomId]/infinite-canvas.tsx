"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";

type InfiniteCanvasProps = {
  children?: React.ReactNode;
};

// Define the boundaries for the canvas (how far you can pan before looping)
const LOOP_BOUNDARY = 2000; // pixels

export default function InfiniteCanvas({ children }: InfiniteCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  // Function to loop position back when exceeding boundaries
  const loopPosition = useCallback((pos: { x: number; y: number }) => {
    return {
      x: ((pos.x % LOOP_BOUNDARY) + LOOP_BOUNDARY) % LOOP_BOUNDARY,
      y: ((pos.y % LOOP_BOUNDARY) + LOOP_BOUNDARY) % LOOP_BOUNDARY,
    };
  }, []);

  // Handle mouse down - start panning
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only pan with left click or middle click, and not if clicking on interactive elements
      if (e.button === 0 || e.button === 1) {
        const target = e.target as HTMLElement;
        // Don't pan if clicking on a draggable element or button
        if (
          target.closest('[data-draggable="true"]') ||
          target.closest("button")
        ) {
          return;
        }
        setIsPanning(true);
        setStartPos({
          x: e.clientX - position.x,
          y: e.clientY - position.y,
        });
      }
    },
    [position]
  );

  // Handle mouse move - pan the canvas with looping
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning) return;

      const newPosition = {
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y,
      };

      // Update position without looping during drag
      setPosition(newPosition);
    },
    [isPanning, startPos]
  );

  // Handle mouse up - stop panning and apply looping
  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    // Apply looping only when mouse is released
    setPosition((prev) => loopPosition(prev));
  }, [loopPosition]);

  // Handle wheel - zoom in/out
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();

      const delta = e.deltaY * -0.001;
      const newZoom = Math.min(Math.max(0.1, zoom + delta), 3);

      setZoom(newZoom);
    },
    [zoom]
  );

  // Change cursor when panning
  useEffect(() => {
    if (isPanning) {
      document.body.style.cursor = "grabbing";
    } else {
      document.body.style.cursor = "default";
    }

    return () => {
      document.body.style.cursor = "default";
    };
  }, [isPanning]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden bg-[var(--color-primary-50)]"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: isPanning ? "grabbing" : "grab" }}
    >
      {/* Dotted background pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, #d1d5db 1.5px, transparent 1.5px)",
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          backgroundPosition: `${position.x % LOOP_BOUNDARY}px ${
            position.y % LOOP_BOUNDARY
          }px`,
        }}
      />

      {/* Canvas content */}
      <motion.div
        className="absolute"
        style={{
          x: position.x,
          y: position.y,
          scale: zoom,
          transformOrigin: "0 0",
        }}
      >
        {children}
      </motion.div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-white rounded-lg shadow-lg border-2 border-[var(--color-border)] p-2">
        <button
          onClick={() => setZoom(Math.min(3, zoom + 0.1))}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
          aria-label="Zoom in"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 3V13M3 8H13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <div className="text-xs text-center text-gray-600 font-medium">
          {Math.round(zoom * 100)}%
        </div>
        <button
          onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
          aria-label="Zoom out"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 8H13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPosition({ x: 0, y: 0 });
          }}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors text-xs"
          aria-label="Reset view"
        >
          ⟲
        </button>
      </div>
    </div>
  );
}
