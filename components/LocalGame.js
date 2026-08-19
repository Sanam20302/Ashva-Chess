"use client";

import { useState } from "react";
import { Chess } from "chess.js";
import ChessBoard from "./ChessBoard";
import GamePanel, { getCapturedFromHistory } from "./GamePanel";
import { pickAiMove } from "@/lib/chessAi";
import { cloneChess } from "@/lib/cloneChess";

export default function LocalGame({ onExit }) {
  const [game, setGame] = useState(() => new Chess());
  const [difficulty, setDifficulty] = useState(2);
  const [side, setSide] = useState("w");
  const [aiThinking, setAiThinking] = useState(false);

  const history = game.history({ verbose: true });
  const captured = getCapturedFromHistory(history);
  const lastMove = history[history.length - 1] || null;

  function runAiTurn(currentGame) {
    if (currentGame.isGameOver() || currentGame.turn() === side) return;
    setAiThinking(true);
    setTimeout(() => {
      const next = cloneChess(currentGame);
      const aiMove = pickAiMove(next, difficulty);
      if (aiMove) next.move(aiMove);
      setAiThinking(false);
      setGame(next);
    }, 220);
  }

  function handleMove(from, to) {
    const next = cloneChess(game);
    const legal = next.moves({ square: from, verbose: true });
    const target = legal.find((m) => m.to === to);
    const promotion = target && target.flags.includes("p") ? "q" : undefined;
    const move = next.move({ from, to, promotion });
    if (!move) return;
    setGame(next);
    runAiTurn(next);
  }

  function newGame(nextSide = side) {
    const fresh = new Chess();
    setSide(nextSide);
    setAiThinking(false);
    setGame(fresh);
    if (nextSide === "b") runAiTurn(fresh);
  }

  function undo() {
    if (game.history().length === 0 || aiThinking) return;
    const next = cloneChess(game);
    next.undo();
    if (next.history().length > 0 && next.turn() !== side) next.undo();
    setGame(next);
  }

  function statusText() {
    if (aiThinking) return "Computer is thinking…";
    if (game.isCheckmate()) {
      const winner = game.turn() === "w" ? "Black" : "White";
      return `Checkmate — ${winner} wins`;
    }
    if (game.isStalemate()) return "Stalemate — draw";
    if (game.isThreefoldRepetition()) return "Draw by repetition";
    if (game.isInsufficientMaterial()) return "Draw — insufficient material";
    if (game.isDraw()) return "Draw";
    const turn = game.turn() === "w" ? "White" : "Black";
    return game.isCheck() ? `${turn} to move — check` : `${turn} to move`;
  }

  return (
    <div className="wrap">
      <header>
        <div>
          <h1>Ashva</h1>
          <div className="tagline">Playing against the computer</div>
        </div>
        <button onClick={onExit}>← Menu</button>
      </header>

      <div className="board-side">
        <ChessBoard
          key={game.fen()}
          game={game}
          orientation={side}
          interactive={!aiThinking && game.turn() === side}
          onMove={handleMove}
          lastMove={lastMove}
        />
        <div className={"status-bar" + (aiThinking ? " thinking" : "")}>
          {statusText()}
        </div>
        <div className="controls">
          <button className="primary" onClick={() => newGame(side)}>
            New Game
          </button>
          <button onClick={undo}>Undo</button>
          <button onClick={() => newGame(side === "w" ? "b" : "w")}>
            Flip Board
          </button>
        </div>
      </div>

      <GamePanel captured={captured} history={history}>
        <div className="field">
          <label htmlFor="difficulty">Computer Strength</label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(parseInt(e.target.value, 10))}
          >
            <option value={1}>Casual (1 move ahead)</option>
            <option value={2}>Club Player (2 moves ahead)</option>
            <option value={3}>Sharp (3 moves ahead)</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="side">Play As</label>
          <select
            id="side"
            value={side}
            onChange={(e) => newGame(e.target.value)}
          >
            <option value="w">White</option>
            <option value="b">Black</option>
          </select>
        </div>
      </GamePanel>
    </div>
  );
}
