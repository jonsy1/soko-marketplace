'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function loadMessages() {
    const res = await fetch(`/api/conversations/${id}/messages`);
    const data = await res.json();
    setMessages(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    const res = await fetch(`/api/conversations/${id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: text }),
    });
    setSending(false);
    if (res.ok) {
      setText('');
      loadMessages();
    }
  }

  const myId = (session?.user as any)?.id;

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-10 text-night/50">Loading…</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-64px)]">
      <h1 className="font-display text-lg font-bold mb-4">Conversation</h1>
      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {messages.map((m) => {
          const isMine = m.senderId === myId;
          return (
            <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={
                  isMine
                    ? 'bg-market-500 text-white rounded-card px-3 py-2 max-w-xs text-sm'
                    : 'bg-white border border-night/10 rounded-card px-3 py-2 max-w-xs text-sm'
                }
              >
                <p>{m.body}</p>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <p className="text-night/50 text-sm text-center mt-8">
            Say hello and ask your question.
          </p>
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-night/10">
        <input
          className="input flex-1"
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn btn-primary" disabled={sending}>
          Send
        </button>
      </form>
    </div>
  );
}