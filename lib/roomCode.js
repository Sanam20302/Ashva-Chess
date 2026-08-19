// Avoid visually ambiguous characters (0/O, 1/I/L) so codes are easy to read aloud
// and type into a Slack DM without a follow-up "was that a zero or an O?" question.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateRoomCode(length = 5) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}
