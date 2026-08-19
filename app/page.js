"use client";

import { useState } from "react";
import Menu from "@/components/Menu";
import LocalGame from "@/components/LocalGame";
import HostGame from "@/components/HostGame";
import JoinGame from "@/components/JoinGame";

export default function Home() {
  const [view, setView] = useState("menu");

  if (view === "local") return <LocalGame onExit={() => setView("menu")} />;
  if (view === "host") return <HostGame onExit={() => setView("menu")} />;
  if (view === "join") return <JoinGame onExit={() => setView("menu")} />;
  return <Menu onSelect={setView} />;
}
