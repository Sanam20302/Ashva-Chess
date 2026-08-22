"use client";

import { useEffect, useRef, useState } from "react";
import { createGame, cancelGame, subscribeToGame } from "@/lib/gamesApi";
import MultiplayerGame from "./MultiplayerGame";

export default function HostGame({ onExit }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("random");
  const [room, setRoom] = useState(null);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copy Code");
  const unsubRef = useRef(null);

  useEffect(() => () => unsubRef.current?.(), []);

  // The live game view (MultiplayerGame) opens its own subscription for the
  // same room once it mounts. Tear down this lobby-only subscription right
  // as we hand off, so we're never listening on the same room twice at once.
  useEffect(() => {
    if (room?.status === "active" && unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }
  }, [room?.status]);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      const hostColor = color === "random" ? (Math.random() < 0.5 ? "w" : "b") : color;
      const data = await createGame({ hostColor, hostName: name.trim() || "Host" });
      setRoom(data);
      unsubRef.current = subscribeToGame(data.code, (newRow) => {
        if (!newRow || !newRow.code) return;
        setRoom(newRow);
      });
    } catch (err) {
      setError(err.message || "Couldn't create a game. Try again.");
    } finally {
      setCreating(false);
    }
  }

  async function handleCancel() {
    unsubRef.current?.();
    if (room) await cancelGame(room.code);
    setRoom(null);
    onExit();
  }

  function copyCode() {
    navigator.clipboard?.writeText(room.code).then(() => {
      setCopyLabel("Copied!");
      setTimeout(() => setCopyLabel("Copy Code"), 1500);
    });
  }

  if (room && room.status === "active") {
    return (
      <MultiplayerGame
        code={room.code}
        myColor={room.host_color || "w"}
        myName={room.host_name || "Host"}
        initialRow={room}
        onExit={onExit}
      />
    );
  }

  return (
    <div className="wrap">
      <header>
        <div>
          <h1>
            End<span className="accent">game</span>
          </h1>
          <div className="tagline">Host a game</div>
        </div>
        <button onClick={onExit}>← Menu</button>
      </header>

      <div className="menu-column">
        {!room ? (
          <form className="lobby-card" onSubmit={handleCreate}>
            <div className="field">
              <label htmlFor="hostName">Your name</label>
              <input
                id="hostName"
                type="text"
                placeholder="e.g. Priya"
                maxLength={24}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="hostColor">Play as</label>
              <select id="hostColor" value={color} onChange={(e) => setColor(e.target.value)}>
                <option value="random">Random</option>
                <option value="w">White</option>
                <option value="b">Black</option>
              </select>
            </div>
            {error && <div className="error-text">{error}</div>}
            <button className="primary" type="submit" disabled={creating}>
              {creating ? "Creating…" : "Create Game"}
            </button>
          </form>
        ) : (
          <div className="lobby-card waiting-card">
            <div className="field">
              <label>Share this code with your friend</label>
              <div className="room-code-big" onClick={copyCode} title="Click to copy">
                {room.code}
              </div>
              <button onClick={copyCode}>{copyLabel}</button>
            </div>
            <div className="status-bar thinking">Waiting for your friend to join…</div>
            <button onClick={handleCancel}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}
