// Same minimax + alpha-beta engine as the original local version, just moved
// into its own module so both the vs-computer mode and any future bot
// opponent (e.g. "have the bot sub in if your friend disconnects") can use it.

const VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

const PST = {
  p: [0,0,0,0,0,0,0,0, 50,50,50,50,50,50,50,50, 10,10,20,30,30,20,10,10,
      5,5,10,25,25,10,5,5, 0,0,0,20,20,0,0,0, 5,-5,-10,0,0,-10,-5,5,
      5,10,10,-20,-20,10,10,5, 0,0,0,0,0,0,0,0],
  n: [-50,-40,-30,-30,-30,-30,-40,-50, -40,-20,0,0,0,0,-20,-40, -30,0,10,15,15,10,0,-30,
      -30,5,15,20,20,15,5,-30, -30,0,15,20,20,15,0,-30, -30,5,10,15,15,10,5,-30,
      -40,-20,0,5,5,0,-20,-40, -50,-40,-30,-30,-30,-30,-40,-50],
  b: [-20,-10,-10,-10,-10,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,10,10,5,0,-10,
      -10,5,5,10,10,5,5,-10, -10,0,10,10,10,10,0,-10, -10,10,10,10,10,10,10,-10,
      -10,5,0,0,0,0,5,-10, -20,-10,-10,-10,-10,-10,-10,-20],
  r: [0,0,0,0,0,0,0,0, 5,10,10,10,10,10,10,5, -5,0,0,0,0,0,0,-5,
      -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5,
      -5,0,0,0,0,0,0,-5, 0,0,0,5,5,0,0,0],
  q: [-20,-10,-10,-5,-5,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,5,5,5,0,-10,
      -5,0,5,5,5,5,0,-5, 0,0,5,5,5,5,0,-5, -10,5,5,5,5,5,0,-10,
      -10,0,5,0,0,0,0,-10, -20,-10,-10,-5,-5,-10,-10,-20],
  k: [-30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30,
      -30,-40,-40,-50,-50,-40,-40,-30, -20,-30,-30,-40,-40,-30,-30,-20, -10,-20,-20,-20,-20,-20,-20,-10,
      20,20,0,0,0,0,20,20, 20,30,10,0,0,10,30,20],
};

function squareIndex(square) {
  const file = square.charCodeAt(0) - 97;
  const rank = 8 - parseInt(square[1], 10);
  return rank * 8 + file;
}

function pstValue(piece, square, color) {
  let idx = squareIndex(square);
  if (color === "b") idx = 63 - idx;
  return PST[piece][idx];
}

function evaluateBoard(g) {
  if (g.isCheckmate()) return g.turn() === "w" ? -100000 : 100000;
  if (g.isDraw() || g.isStalemate() || g.isThreefoldRepetition()) return 0;
  const board = g.board();
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const cell = board[r][f];
      if (!cell) continue;
      const file = "abcdefgh"[f];
      const rank = 8 - r;
      const square = file + rank;
      const val = VALUES[cell.type] + pstValue(cell.type, square, cell.color);
      score += cell.color === "w" ? val : -val;
    }
  }
  return score;
}

function minimax(g, depth, alpha, beta, maximizing) {
  if (depth === 0 || g.isGameOver()) return evaluateBoard(g);
  const moves = g.moves({ verbose: true });
  if (maximizing) {
    let best = -Infinity;
    for (const m of moves) {
      g.move(m);
      const val = minimax(g, depth - 1, alpha, beta, false);
      g.undo();
      best = Math.max(best, val);
      alpha = Math.max(alpha, val);
      if (beta <= alpha) break;
    }
    return best;
  }
  let best = Infinity;
  for (const m of moves) {
    g.move(m);
    const val = minimax(g, depth - 1, alpha, beta, true);
    g.undo();
    best = Math.min(best, val);
    beta = Math.min(beta, val);
    if (beta <= alpha) break;
  }
  return best;
}

export function pickAiMove(game, depth) {
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return null;
  const aiIsWhite = game.turn() === "w";
  let bestMoves = [];
  let bestScore = aiIsWhite ? -Infinity : Infinity;
  moves.sort(() => Math.random() - 0.5);
  for (const m of moves) {
    game.move(m);
    const score = minimax(game, depth - 1, -Infinity, Infinity, !aiIsWhite);
    game.undo();
    if (aiIsWhite) {
      if (score > bestScore) { bestScore = score; bestMoves = [m]; }
      else if (score === bestScore) bestMoves.push(m);
    } else {
      if (score < bestScore) { bestScore = score; bestMoves = [m]; }
      else if (score === bestScore) bestMoves.push(m);
    }
  }
  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}
