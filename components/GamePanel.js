"use client";

const PIECES = {
  w: { p: "♙", n: "♘", b: "♗", r: "♖", q: "♕", k: "♔" },
  b: { p: "♟", n: "♞", b: "♝", r: "♜", q: "♛", k: "♚" },
};
const ORDER = { q: 0, r: 1, b: 2, n: 3, p: 4 };

export function getCapturedFromHistory(history) {
  const captured = { w: [], b: [] };
  history.forEach((m) => {
    if (m.captured) {
      const capturedColor = m.color === "w" ? "b" : "w";
      captured[m.color].push({ type: m.captured, color: capturedColor });
    }
  });
  return captured;
}

export default function GamePanel({ children, captured, history }) {
  const sorted = [...captured.w, ...captured.b].sort(
    (a, b) => ORDER[a.type] - ORDER[b.type]
  );

  const rows = [];
  for (let i = 0; i < history.length; i += 2) {
    rows.push({
      num: i / 2 + 1,
      white: history[i]?.san || "",
      black: history[i + 1]?.san || "",
    });
  }

  return (
    <div className="panel">
      {children}
      <div className="field">
        <h2>Captured</h2>
        <div id="captured">
          {sorted.map((p, i) => (
            <span
              key={i}
              className={p.color === "w" ? "cap-white" : "cap-black"}
            >
              {PIECES[p.color][p.type]}
            </span>
          ))}
        </div>
      </div>
      <div className="field">
        <h2>Moves</h2>
        <ol id="moveList">
          {rows.map((r) => (
            <li key={r.num}>
              <span className="num">{r.num}.</span>
              <span>{r.white}</span>
              <span>{r.black}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
