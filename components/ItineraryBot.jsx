'use client';
import { useState, useRef, useEffect } from 'react';

export default function ItineraryBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hey traveler! 👋 Tell me a city and I'll craft a personalized itinerary for you — free!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickChips = ['3 days in Bali', 'Weekend in Tokyo', 'Budget Paris trip'];

  async function sendMessage(text) {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);

    try {
  const res = await fetch('/api/itinerary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: msg })
  });
  const data = await res.json();
  const reply = data.reply || "Couldn't fetch that. Try again!";
  setMessages(prev => [...prev, { role: 'bot', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: "Connection issue. Try again in a moment!" }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '90px', right: '24px',
          width: '340px', maxHeight: '500px',
          background: 'var(--color-ocean-mid)',
          border: '0.5px solid var(--color-glass-border)',
          borderRadius: '20px', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          zIndex: 1000, boxShadow: '0 16px 48px rgba(0,0,0,0.4)'
        }}>
          {/* Header */}
          <div style={{
            padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px',
            background: 'var(--color-ocean-light)',
            borderBottom: '0.5px solid var(--color-glass-border)'
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(125,216,192,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
            }}>🧭</div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Itinerary Assistant</p>
              <p style={{ fontSize: 11, color: 'var(--color-seafoam)', margin: 0 }}>Ask me about any city</p>
            </div>
            <button onClick={() => setIsOpen(false)} style={{
              marginLeft: 'auto', background: 'none', border: 'none',
              color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 18
            }}>✕</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', background: 'rgba(125,216,192,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0
                }}>{m.role === 'bot' ? '🤖' : '🧳'}</div>
                <div style={{
                  maxWidth: '78%', padding: '9px 13px', fontSize: 13, lineHeight: 1.5,
                  borderRadius: m.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                  background: m.role === 'user' ? 'var(--color-teal-primary)' : 'var(--color-glass)',
                  color: 'var(--color-text-primary)',
                  border: m.role === 'bot' ? '0.5px solid var(--color-glass-border)' : 'none',
                  whiteSpace: 'pre-wrap'
                }}>{m.text}</div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(125,216,192,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
                <div style={{ padding: '12px 16px', background: 'var(--color-glass)', border: '0.5px solid var(--color-glass-border)', borderRadius: '4px 14px 14px 14px', display: 'flex', gap: 4 }}>
                  {[0,1,2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-seafoam)', display: 'inline-block', animation: `blink 1.2s ${i*0.2}s infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '0 12px 10px' }}>
            {quickChips.map(c => (
              <button key={c} onClick={() => sendMessage(c)} style={{
                background: 'rgba(125,216,192,0.08)',
                border: '0.5px solid rgba(125,216,192,0.25)',
                borderRadius: 20, padding: '5px 11px',
                fontSize: 11, color: 'var(--color-seafoam)',
                cursor: 'pointer', fontFamily: 'inherit'
              }}>{c}</button>
            ))}
          </div>

          {/* Input */}
          <div style={{ display: 'flex', gap: 8, padding: '10px 12px', borderTop: '0.5px solid var(--color-glass-border)', background: 'rgba(0,0,0,0.15)' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about any city..."
              style={{
                flex: 1, background: 'var(--color-glass)', border: '0.5px solid var(--color-glass-border)',
                borderRadius: 20, padding: '8px 14px', fontSize: 13,
                color: 'var(--color-text-primary)', fontFamily: 'inherit', outline: 'none'
              }}
            />
            <button onClick={() => sendMessage()} style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--color-teal-primary)', border: 'none',
              cursor: 'pointer', color: 'white', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>➤</button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button onClick={() => setIsOpen(o => !o)} style={{
        position: 'fixed', bottom: 24, right: 24,
        width: 56, height: 56, borderRadius: '50%',
        background: 'linear-gradient(135deg, #1a8a72, #0f6e56)',
        border: 'none', cursor: 'pointer', zIndex: 1001,
        boxShadow: '0 4px 20px rgba(26,138,114,0.45)',
        fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>🧭</button>
    </>
  );
}