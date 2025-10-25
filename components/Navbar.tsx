"use client";
import Dock from "./Dock";
import { Blocks, PencilLine, Video, UserRound } from "lucide-react";

const items = [
  { icon: <Blocks size={18} />, label: "Home", onClick: () => alert("Home!") },
  {
    icon: <PencilLine size={18} />,
    label: "Archive",
    onClick: () => alert("Archive!"),
  },
  {
    icon: <Video size={18} />,
    label: "Profile",
    onClick: () => alert("Profile!"),
  },
  {
    icon: <UserRound size={18} />,
    label: "Settings",
    onClick: () => alert("Settings!"),
  },
];

import React from "react";

function Navbar() {
  return (
    <Dock items={items} panelHeight={68} baseItemSize={50} magnification={70} />
  );
}

export default Navbar;
