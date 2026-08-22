import { supabase } from "./supabaseClient";
import { generateRoomCode } from "./roomCode";

const START_FEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export async function createGame({ hostColor, hostName }) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateRoomCode();
    const { data, error } = await supabase
      .from("games")
      .insert({
        code,
        pgn: "",
        fen: START_FEN,
        turn: "w",
        host_color: hostColor,
        host_name: hostName || "Host",
        status: "waiting",
      })
      .select()
      .single();
    if (!error) return data;
    if (error.code !== "23505") throw error;
  }
  throw new Error("Could not create a game room. Please try again.");
}

export async function fetchGame(code) {
  const { data, error } = await supabase
    .from("games")
    .select()
    .eq("code", code)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function joinGame({ code, guestName }) {
  const room = await fetchGame(code);
  if (!room) return { error: "No game found with that code." };
  if (room.status !== "waiting") {
    return { error: "That game has already started or finished." };
  }
  const { data, error } = await supabase
    .from("games")
    .update({
      guest_name: guestName || "Guest",
      status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("code", code)
    .eq("status", "waiting")
    .select()
    .maybeSingle();
  if (error) throw error;
  if (!data) return { error: "Someone else just joined that game." };
  return { data };
}

export async function pushMove({ code, pgn, fen, turn, status, winner }) {
  const { error } = await supabase
    .from("games")
    .update({ pgn, fen, turn, status, winner, updated_at: new Date().toISOString() })
    .eq("code", code);
  if (error) throw error;
}

export async function cancelGame(code) {
  await supabase.from("games").delete().eq("code", code);
}

export async function resetGame(code) {
  await supabase
    .from("games")
    .update({
      pgn: "",
      fen: START_FEN,
      turn: "w",
      status: "active",
      winner: null,
      updated_at: new Date().toISOString(),
    })
    .eq("code", code);
}

export function subscribeToGame(code, onChange, channelPrefix = "game") {
  const channel = supabase
    .channel(`${channelPrefix}-${code}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "games", filter: `code=eq.${code}` },
      (payload) => onChange(payload.new)
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}

export async function fetchMessages(code) {
  const { data, error } = await supabase
    .from("game_messages")
    .select()
    .eq("game_code", code)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function sendMessage({ code, sender, color, body }) {
  const { error } = await supabase
    .from("game_messages")
    .insert({ game_code: code, sender, color, body: body.slice(0, 300) });
  if (error) throw error;
}

export function subscribeToMessages(code, onInsert) {
  const channel = supabase
    .channel(`messages-${code}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "game_messages", filter: `game_code=eq.${code}` },
      (payload) => onInsert(payload.new)
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}
