"use client";

import { useState } from "react";

const PIECES = {
  w: { p: "♙", n: "♘", b: "♗", r: "♖", q: "♕", k: "♔" },
  b: { p: "♟", n: "♞", b: "♝", r: "♜", q: "♛", k: "♚" },
};

function squareName(row, col, flipped) {
  let file, rank;
  if (!flipped) {
    file = col;
    rank = 8 - row;
  } else {
    file = 7 - col;
    rank = row + 1;
  }
  return "abcdefgh"[file] + rank;
}

/**
 * Controlled-ish chess board. The parent owns the chess.js `game` instance;
 * this component just renders it and reports intended moves back up via
 * onMove. `version` should change any time `game`'s position changes, so the
 * board knows to re-render and clear any stale selection.
 */
export default function ChessBoard({
  game,
  orientation = "w",
  interactive = true,
  onMove,
  lastMove,
}) {
  const flipped = orientation === "b";
  const [selected, setSelected] = useState(null);
  const [legalTargets, setLegalTargets] = useState([]);

  if (!game) return null;

  const board = game.board();
  const inCheck = game.isCheck();
  const turn = game.turn();

  let checkSquare = null;
  if (inCheck) {
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const cell = board[r][f];
        if (cell && cell.type === "k" && cell.color === turn) {
          checkSquare = "abcdefgh"[f] + (8 - r);
        }
      }
    }
  }

  function handleClick(square) {
    if (!interactive) return;
    if (game.isGameOver()) return;
    const piece = game.get(square);

    if (selected) {
      const move = legalTargets.find((m) => m.to === square);
      if (move) {
        onMove(selected, square);
        setSelected(null);
        setLegalTargets([]);
        return;
      }
      if (piece && piece.color === turn) {
        setSelected(square);
        setLegalTargets(game.moves({ square, verbose: true }));
      } else {
        setSelected(null);
        setLegalTargets([]);
      }
      return;
    }

    if (piece && piece.color === turn) {
      setSelected(square);
      setLegalTargets(game.moves({ square, verbose: true }));
    }
  }

  const cells = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = squareName(row, col, flipped);
      const file = square.charCodeAt(0) - 97;
      const rank = 8 - parseInt(square[1], 10);
      const piece = board[rank][file];
      const isLight = (row + col) % 2 === (flipped ? 1 : 0);

      const classes = ["sq", isLight ? "light" : "dark"];
      if (selected === square) classes.push("selected");
      const legalMatch = legalTargets.find((m) => m.to === square);
      if (legalMatch) {
        classes.push("legal");
        if (legalMatch.flags.includes("c") || legalMatch.flags.includes("e")) {
          classes.push("capture");
        }
      }
      if (lastMove && lastMove.from === square) classes.push("last-from");
      if (lastMove && lastMove.to === square) classes.push("last-to");
      if (checkSquare === square) classes.push("in-check");
      if (piece) classes.push(piece.color === "w" ? "piece-white" : "piece-black");

      cells.push(
        <div
          key={square}
          className={classes.join(" ")}
          onClick={() => handleClick(square)}
        >
          {piece ? PIECES[piece.color][piece.type] : ""}
        </div>
      );
    }
  }

  const filesList = (flipped ? "hgfedcba" : "abcdefgh").split("");
  const ranksList = (flipped ? "12345678" : "87654321").split("");

  return (
    <div className="board-column">
      <div id="board-frame">
        <div className="frame-ranks">
          {ranksList.map(r => <span key={r}>{r}</span>)}
        </div>
        <div className="frame-files">
          {filesList.map(f => <span key={f}>{f}</span>)}
        </div>
        <div id="board">{cells}</div>
      </div>
    </div>
  );
}
