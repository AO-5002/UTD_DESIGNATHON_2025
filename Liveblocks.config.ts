import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY || "",
});

type Piece = {
  id: string;
  color: string;
  text: string;
};

type Presence = {
  cursor: { x: number; y: number } | null;
  editingPieceId: string | null; // Track which piece user is editing
};

type Storage = {
  pieces: Piece[];
};

export const {
  RoomProvider,
  useStorage,
  useMutation,
  useRoom,
  useSelf,
  useOthers,
  useUpdateMyPresence,
} = createRoomContext<Presence, Storage>(client);

export type { Piece, Storage, Presence };
