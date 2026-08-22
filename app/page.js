"use client";

import { useState } from "react";
import Menu from "@/components/Menu";
import LocalGame from "@/components/LocalGame";
import HostGame from "@/components/HostGame";
import JoinGame from "@/components/JoinGame";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function Home() {
  const [view, setView] = useState("menu");

  return (
    <ErrorBoundary key={view}>
      {view === "local" && <LocalGame onExit={() => setView("menu")} />}
      {view === "host" && <HostGame onExit={() => setView("menu")} />}
      {view === "join" && <JoinGame onExit={() => setView("menu")} />}
      {view === "menu" && <Menu onSelect={setView} />}
    </ErrorBoundary>
  );
}
