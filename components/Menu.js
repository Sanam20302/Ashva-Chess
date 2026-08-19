"use client";

import { isSupabaseConfigured } from "@/lib/supabaseClient";

// SVG Icons
const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const PawnIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a3 3 0 0 0-3 3c0 1.16.66 2.17 1.62 2.68a3 3 0 0 0-2.62 2.82v1A2.5 2.5 0 0 0 10.5 14h3a2.5 2.5 0 0 0 2.5-2.5v-1a3 3 0 0 0-2.62-2.82 3 3 0 0 0 1.62-2.68 3 3 0 0 0-3-3zM8 16c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-1H8v1zM6 21a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v1z"/>
  </svg>
);

const GroupIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </svg>
);

const PersonIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const TinyPawn = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a3 3 0 0 0-3 3c0 1.16.66 2.17 1.62 2.68a3 3 0 0 0-2.62 2.82v1A2.5 2.5 0 0 0 10.5 14h3a2.5 2.5 0 0 0 2.5-2.5v-1a3 3 0 0 0-2.62-2.82 3 3 0 0 0 1.62-2.68 3 3 0 0 0-3-3zM8 16c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-1H8v1zM6 21a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v1z"/>
  </svg>
);

export default function Menu({ onSelect }) {
  return (
    <>
      <div className="bg-texture" />
      <div className="checker-watermark" />
      
      <div className="menu-page-container">
        <div className="menu-hero">
          <h1>Ashva</h1>
          <div className="tagline">CHESS BEYOND THE PAYWALL</div>
          <div className="divider">
            <TinyPawn />
          </div>
          <div className="menu-desc">
            <span className="desc-part">Everything you love about chess.</span>
            <br className="desc-br" />
            <span className="desc-dot"> • </span>
            <span className="desc-part">No limits. No fees. Just strategy.</span>
          </div>
        </div>

        <div className="premium-cards-container">
          <button className="premium-card" onClick={() => onSelect("local")}>
            <div className="card-icon-wrap"><PawnIcon /></div>
            <div className="card-title">Play vs Computer</div>
            <div className="card-accent" />
            <div className="card-desc">Practice alone, three difficulty levels</div>
            <div className="card-cta">Start Playing <ArrowRightIcon /></div>
          </button>
          
          <button
            className="premium-card"
            onClick={() => onSelect("host")}
            disabled={!isSupabaseConfigured}
          >
            <div className="card-icon-wrap"><GroupIcon /></div>
            <div className="card-title">Host a Game</div>
            <div className="card-accent" />
            <div className="card-desc">Get a room code to send a friend</div>
            <div className="card-cta">Create Room <ArrowRightIcon /></div>
          </button>
          
          <button
            className="premium-card"
            onClick={() => onSelect("join")}
            disabled={!isSupabaseConfigured}
          >
            <div className="card-icon-wrap"><PersonIcon /></div>
            <div className="card-title">Join a Game</div>
            <div className="card-accent" />
            <div className="card-desc">Type in a code someone sent you</div>
            <div className="card-cta">Join Game <ArrowRightIcon /></div>
          </button>
        </div>
        
        {!isSupabaseConfigured && (
          <div className="error-text" style={{ maxWidth: 420 }}>
            Multiplayer needs Supabase configured — see the README for the two
            environment variables to set. Vs-computer mode works either way.
          </div>
        )}

      </div>
    </>
  );
}
