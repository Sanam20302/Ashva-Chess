"use client";

import { useState } from "react";
import { joinGame } from "@/lib/gamesApi";
import MultiplayerGame from "./MultiplayerGame";

export default function JoinGame({ onExit }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [room, setRoom] = useState(null);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);

  async function handleJoin(e) {
    e.preventDefault();
    setError("");
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;
    setJoining(true);
    try {
      const result = await joinGame({ code: cleanCode, guestName: name.trim() || "Guest" });
      if (result.error) {
        setError(result.error);
      } else {
        setRoom(result.data);
      }
    } catch (err) {
      setError(err.message || "Couldn't join that game. Try again.");
    } finally {
      setJoining(false);
    }
  }

  if (room) {
    const guestColor = room.host_color === "w" ? "b" : "w";
    return (
      <MultiplayerGame
        code={room.code}
        myColor={guestColor}
        myName={room.guest_name}
        initialRow={room}
        onExit={onExit}
      />
    );
  }

  return (
    <div className="wrap">
      <header>
        <div>
          <h1>Ashva</h1>
          <div className="tagline">Join a game</div>
        </div>
        <button onClick={onExit}>← Menu</button>
      </header>

      <div className="menu-column">
        <form className="lobby-card" onSubmit={handleJoin}>
          <div className="field">
            <label htmlFor="guestName">Your name</label>
            <input
              id="guestName"
              type="text"
              placeholder="e.g. Arjun"
              maxLength={24}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="joinCode">Room code</label>
            <input
              id="joinCode"
              type="text"
              placeholder="e.g. K7QX2"
              maxLength={8}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              style={{ letterSpacing: "3px", fontSize: "18px", textTransform: "uppercase" }}
            />
          </div>
          {error && <div className="error-text">{error}</div>}
          <button className="primary" type="submit" disabled={joining}>
            {joining ? "Joining…" : "Join Game"}
          </button>
        </form>
      </div>
    </div>
  );
}
