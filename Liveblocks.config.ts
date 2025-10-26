import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY || "",
});

type PieceData = {
  id: string;
  color: string;
  text: string;
  type?: "regular" | "consolidated";
  gridPositions?: { row: number; col: number }[];
  sourceIds?: string[];
  colors?: string[];
};

type SoundEvent = {
  id: string;
  soundUrl: string;
  timestamp: number;
};

type Storage = {
  pieces: PieceData[];
  soundEvents: SoundEvent[];
};

type Presence = {
  cursor: { x: number; y: number } | null;
  name: string;
  color: string;
};

export const {
  RoomProvider,
  useStorage,
  useMutation,
  useOthers,
  useSelf,
  useRoom,
  useUpdateMyPresence,
} = createRoomContext<Presence, Storage>(client);
