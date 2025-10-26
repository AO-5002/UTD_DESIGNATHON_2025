"use client";

import { motion, useMotionValue } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { GripVertical } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

type ConnectionSide = "top" | "right" | "bottom" | "left";

type PieceData = {
  x: number;
  y: number;
  ref: HTMLDivElement | null;
  connections: Set<string>;
  motionX: any;
  motionY: any;
};

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
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  allPieces?: Map<string, PieceData>;
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
  onDelete,
  onDuplicate,
  allPieces = new Map(),
}: PuzzlePieceProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [pieceText, setPieceText] = useState(text);
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [connections, setConnections] = useState<Set<string>>(new Set());
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

  // Sync motion values with position state
  useEffect(() => {
    x.set(position.x);
    y.set(position.y);
  }, [position.x, position.y]);

  // Register this piece
  useEffect(() => {
    if (pieceRef.current) {
      allPieces.set(id, {
        x: position.x,
        y: position.y,
        ref: pieceRef.current,
        connections: connections,
        motionX: x,
        motionY: y,
      });
    }
    return () => {
      allPieces.delete(id);
    };
  }, [id, position.x, position.y, connections]);

  const findSnapPosition = (dragX: number, dragY: number) => {
    let snapX = dragX;
    let snapY = dragY;
    let snapped = false;
    let connectedTo: string | null = null;

    // Check all other pieces for snap points
    for (const [otherId, otherPiece] of allPieces.entries()) {
      if (otherId === id || connections.has(otherId)) continue;

      const otherX = otherPiece.x;
      const otherY = otherPiece.y;

      // Check right side connection
      const rightDiff = Math.abs(dragX - (otherX + PIECE_SIZE));
      const rightYDiff = Math.abs(dragY - otherY);
      if (rightDiff < SNAP_DISTANCE && rightYDiff < SNAP_DISTANCE) {
        snapX = otherX + PIECE_SIZE;
        snapY = otherY;
        snapped = true;
        connectedTo = otherId;
        onConnect?.(id, otherId, "right");
        break;
      }

      // Check left side connection
      const leftDiff = Math.abs(dragX - (otherX - PIECE_SIZE));
      const leftYDiff = Math.abs(dragY - otherY);
      if (leftDiff < SNAP_DISTANCE && leftYDiff < SNAP_DISTANCE) {
        snapX = otherX - PIECE_SIZE;
        snapY = otherY;
        snapped = true;
        connectedTo = otherId;
        onConnect?.(id, otherId, "left");
        break;
      }

      // Check bottom side connection
      const bottomDiff = Math.abs(dragY - (otherY + PIECE_SIZE));
      const bottomXDiff = Math.abs(dragX - otherX);
      if (bottomDiff < SNAP_DISTANCE && bottomXDiff < SNAP_DISTANCE) {
        snapY = otherY + PIECE_SIZE;
        snapX = otherX;
        snapped = true;
        connectedTo = otherId;
        onConnect?.(id, otherId, "bottom");
        break;
      }

      // Check top side connection
      const topDiff = Math.abs(dragY - (otherY - PIECE_SIZE));
      const topXDiff = Math.abs(dragX - otherX);
      if (topDiff < SNAP_DISTANCE && topXDiff < SNAP_DISTANCE) {
        snapY = otherY - PIECE_SIZE;
        snapX = otherX;
        snapped = true;
        connectedTo = otherId;
        onConnect?.(id, otherId, "top");
        break;
      }
    }

    // If snapped, create bidirectional connection
    if (snapped && connectedTo) {
      setConnections((prev) => {
        const newConnections = new Set(prev);
        newConnections.add(connectedTo!);
        return newConnections;
      });

      // Also add connection to the other piece
      const otherPiece = allPieces.get(connectedTo);
      if (otherPiece) {
        otherPiece.connections.add(id);
      }
    }

    return { x: snapX, y: snapY, snapped };
  };

  const moveConnectedPieces = (
    deltaX: number,
    deltaY: number,
    movedIds = new Set<string>()
  ) => {
    movedIds.add(id);

    connections.forEach((connectedId) => {
      if (movedIds.has(connectedId)) return;

      const connectedPiece = allPieces.get(connectedId);
      if (connectedPiece) {
        const newX = connectedPiece.x + deltaX;
        const newY = connectedPiece.y + deltaY;

        // Update motion values for smooth movement
        connectedPiece.motionX.set(newX);
        connectedPiece.motionY.set(newY);

        // Update position in the map
        connectedPiece.x = newX;
        connectedPiece.y = newY;

        // Recursively move connected pieces
        movedIds.add(connectedId);
        const subConnections = connectedPiece.connections;
        subConnections.forEach((subId) => {
          if (!movedIds.has(subId)) {
            const subPiece = allPieces.get(subId);
            if (subPiece) {
              const subNewX = subPiece.x + deltaX;
              const subNewY = subPiece.y + deltaY;
              subPiece.motionX.set(subNewX);
              subPiece.motionY.set(subNewY);
              subPiece.x = subNewX;
              subPiece.y = subNewY;
              movedIds.add(subId);
            }
          }
        });
      }
    });
  };

  const handleTextSave = () => {
    setIsEditing(false);
    onTextChange?.(id, pieceText);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <motion.div
          ref={pieceRef}
          data-draggable="true"
          drag
          dragMomentum={false}
          dragElastic={0}
          onDragStart={() => {
            setIsDragging(true);
          }}
          onDrag={(event, info) => {
            const deltaX = info.delta.x;
            const deltaY = info.delta.y;

            // Update position in map
            const piece = allPieces.get(id);
            if (piece) {
              piece.x += deltaX;
              piece.y += deltaY;
            }

            // Move connected pieces
            moveConnectedPieces(deltaX, deltaY);
          }}
          onDragEnd={(event, info) => {
            setIsDragging(false);
            const dragX = position.x + info.offset.x;
            const dragY = position.y + info.offset.y;

            const {
              x: snapX,
              y: snapY,
              snapped,
            } = findSnapPosition(dragX, dragY);

            // If snapped, move all connected pieces by snap delta
            if (snapped) {
              const snapDeltaX = snapX - dragX;
              const snapDeltaY = snapY - dragY;
              moveConnectedPieces(snapDeltaX, snapDeltaY);
            }

            // Update final position
            setPosition({ x: snapX, y: snapY });
            onPositionChange?.(id, snapX, snapY);

            // Update all connected pieces' positions in parent state
            connections.forEach((connectedId) => {
              const piece = allPieces.get(connectedId);
              if (piece) {
                onPositionChange?.(connectedId, piece.x, piece.y);
              }
            });
          }}
          style={{
            x,
            y,
            width: PIECE_SIZE,
            height: PIECE_SIZE,
          }}
          className="absolute select-none cursor-grab active:cursor-grabbing"
        >
          {/* Puzzle Piece SVG Shape */}
          <svg
            width={PIECE_SIZE}
            height={PIECE_SIZE}
            viewBox="0 0 120 120"
            className="absolute inset-0 drop-shadow-lg pointer-events-none"
          >
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

          {/* Drag Handle Indicator - Top Left Corner */}
          <div className="absolute top-2 left-2 w-6 h-6 flex items-center justify-center bg-white/90 rounded-lg pointer-events-none z-10 shadow-sm">
            <GripVertical size={14} className="text-gray-600" />
          </div>

          {/* Text content area */}
          <div className="absolute inset-0 flex items-center justify-center p-4 pt-12 pointer-events-none">
            <div
              className="pointer-events-auto"
              onClick={(e) => {
                e.stopPropagation();
                if (!isEditing && !isDragging) setIsEditing(true);
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
                <p className="text-xs font-medium text-gray-800 text-center break-words w-full px-2 cursor-text">
                  {pieceText || "Click to edit"}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => setIsEditing(true)}>
          Edit Text
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => {
            // Disconnect from all pieces
            connections.forEach((connectedId) => {
              const piece = allPieces.get(connectedId);
              if (piece) {
                piece.connections.delete(id);
              }
            });
            setConnections(new Set());
          }}
        >
          Disconnect All
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onDuplicate?.(id)}>
          Duplicate
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onDelete?.(id)} variant="destructive">
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
