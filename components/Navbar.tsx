"use client";
import Dock from "./Dock";
import { Blocks, Dices, Video, UserRound } from "lucide-react";

const items = [
  {
    icon: <Blocks size={24} />,
    label: "Puzzle",
    onClick: () => alert("Home!"),
  },
  {
    icon: <Dices size={24} />,
    label: "Games",
    onClick: () => alert("Archive!"),
  },
  {
    icon: <Video size={24} />,
    label: "Call",
    onClick: () => alert("Profile!"),
  },
  {
    icon: <UserRound size={24} />,
    label: "Profile",
    onClick: () => alert("Settings!"),
  },
];

function Navbar() {
  return (
    <Dock items={items} panelHeight={68} baseItemSize={50} magnification={78} />
  );
}

export default Navbar;
