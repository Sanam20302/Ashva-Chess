"use client";

import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import ChessBoard from "./ChessBoard";
import GamePanel, { getCapturedFromHistory } from "./GamePanel";
import Chat from "./Chat";
import { cloneChess } from "@/lib/cloneChess";
import {
  pushMove,
  resetGame,
  subscribeToGame,
  subscribeToMessages,
  fetchMessages,
  sendMessage,
} from "@/lib/gamesApi";

function loadFromRow(row) {
  const g = new Chess();
  if (row.pgn) {
    try {
      g.loadPgn(row.pgn);
    } catch (e) {
      // Ignore a malformed pgn rather than crashing the board.
    }
  }
  return g;
}

export default function MultiplayerGame({ code, myColor, myName, initialRow, onExit }) {
  const [game, setGame] = useState(() => loadFromRow(initialRow));
  const [row, setRow] = useState(initialRow);
  const [messages, setMessages] = useState([]);
  const [copyLabel, setCopyLabel] = useState("Copy Code");

  const opponentName =
    myColor === row.host_color ? row.guest_name : row.host_name;

  useEffect(() => {
    const unsubscribe = subscribeToGame(code, (newRow) => {
      setRow(newRow);
      setGame(loadFromRow(newRow));
    });
    fetchMessages(code).then(setMessages).catch(() => {});
    const unsubMessages = subscribeToMessages(code, (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      unsubscribe();
      unsubMessages();
    };
  }, [code]);

  const history = game.history({ verbose: true });
  const captured = getCapturedFromHistory(history);
  const lastMove = history[history.length - 1] || null;
  const myTurn = row.status === "active" && game.turn() === myColor;

  async function handleMove(from, to) {
    const next = cloneChess(game);
    const legal = next.moves({ square: from, verbose: true });
    const target = legal.find((m) => m.to === to);
    const promotion = target && target.flags.includes("p") ? "q" : undefined;
    const move = next.move({ from, to, promotion });
    if (!move) return;
    setGame(next);

    let status = "active";
    let winner = null;
    if (next.isCheckmate()) {
      status = "finished";
      winner = next.turn() === "w" ? "b" : "w";
    } else if (
      next.isDraw() ||
      next.isStalemate() ||
      next.isThreefoldRepetition() ||
      next.isInsufficientMaterial()
    ) {
      status = "finished";
      winner = null;
    }
    try {
      await pushMove({ code, pgn: next.pgn(), fen: next.fen(), turn: next.turn(), status, winner });
    } catch (e) {
      // If the write fails, the next realtime sync (or a manual refresh)
      // will reconcile things — nothing local is lost either way.
    }
  }

  function statusText() {
    if (row.status === "waiting") return "Waiting for opponent…";
    if (row.status === "finished") {
      if (!row.winner) return "Draw";
      const winnerName = row.winner === row.host_color ? row.host_name : row.guest_name;
      return `Checkmate — ${winnerName} wins`;
    }
    const turnColor = game.turn();
    const turnName = turnColor === row.host_color ? row.host_name : row.guest_name;
    const label = turnColor === myColor ? "Your move" : `${turnName}'s move`;
    return game.isCheck() ? `${label} — check` : label;
  }

  function copyCode() {
    navigator.clipboard?.writeText(code).then(() => {
      setCopyLabel("Copied!");
      setTimeout(() => setCopyLabel("Copy Code"), 1500);
    });
  }

  async function handleRematch() {
    await resetGame(code);
  }

  async function handleSend(body) {
    try {
      await sendMessage({ code, sender: myName, color: myColor, body });
    } catch (e) {
      // Best effort — chat isn't critical to gameplay.
    }
  }

  return (
    <div className="wrap">
      <header>
        <div>
          <h1>
            End<span className="accent">game</span>
          </h1>
          <div className="tagline">
            {myName} ({myColor === "w" ? "White" : "Black"}) vs {opponentName || "…"}
          </div>
        </div>
        <div className="header-actions">
          <span className="room-code" onClick={copyCode} title="Click to copy">
            Room {code} · {copyLabel}
          </span>
          <button onClick={onExit}>← Menu</button>
        </div>
      </header>

      <div className="board-side">
        <ChessBoard
          key={game.fen()}
          game={game}
          orientation={myColor}
          interactive={myTurn}
          onMove={handleMove}
          lastMove={lastMove}
        />
        <div className="status-bar">{statusText()}</div>
        <div className="controls">
          {row.status === "finished" && (
            <button className="primary" onClick={handleRematch}>
              Rematch
            </button>
          )}
          <button onClick={onExit}>Leave Game</button>
        </div>
      </div>

      <GamePanel captured={captured} history={history}>
        <Chat messages={messages} onSend={handleSend} myColor={myColor} />
      </GamePanel>
    </div>
  );
}
