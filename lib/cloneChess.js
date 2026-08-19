import { Chess } from "chess.js";

// chess.js instances are mutable, but React needs a new reference to know a
// position changed. Rather than mutate state in place, moves are applied to
// a clone and the clone becomes the new state value.
export function cloneChess(game) {
  const clone = new Chess();
  const pgn = game.pgn();
  if (pgn) clone.loadPgn(pgn);
  return clone;
}
