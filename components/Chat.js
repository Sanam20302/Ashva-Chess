"use client";

import { useEffect, useRef, useState } from "react";

export default function Chat({ messages, onSend, myColor }) {
  const [text, setText] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  function submit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  }

  return (
    <div className="field">
      <h2>Table Talk</h2>
      <div className="chat-list" ref={listRef}>
        {messages.length === 0 && (
          <div className="chat-empty">Say hi to your opponent.</div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={"chat-msg " + (m.color === myColor ? "mine" : "theirs")}
          >
            <span className="chat-sender">{m.sender}:</span> {m.body}
          </div>
        ))}
      </div>
      <form className="chat-form" onSubmit={submit}>
        <input
          type="text"
          value={text}
          maxLength={300}
          placeholder="Type a message…"
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
