"use client";

import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Logged so it's visible in the browser console / Vercel logs even
    // though the user just sees the friendly fallback below.
    console.error("Endgame crashed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="wrap">
          <div className="menu-column">
            <div className="lobby-card waiting-card">
              <div className="tagline">Something went wrong</div>
              <p style={{ color: "rgba(244,236,216,0.75)", fontSize: 14 }}>
                The game view hit an error. Your opponent&apos;s game state is
                safe on the server — reloading will bring you back to a
                clean menu.
              </p>
              <button className="primary" onClick={() => window.location.reload()}>
                Reload
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
