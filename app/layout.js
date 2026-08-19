import "./globals.css";

export const metadata = {
  title: "Ashva — Chess with friends",
  description: "Chess beyond the paywall. Play against the computer, or host/join a game with a room code.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
