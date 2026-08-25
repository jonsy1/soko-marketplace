'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/conversations')
      .then((r) => r.json())
      .then((data) => {
        setConversations(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-10 text-night/50">Loading…</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold mb-6">Messages</h1>
      {conversations.length === 0 && (
        <p className="text-night/50 text-sm">No conversations yet.</p>
      )}
      <div className="space-y-2">
        {conversations.map((c) => {
          const lastMessage = c.messages?.[0];
          return (
            <Link
              key={c.id}
              href={`/messages/${c.id}`}
              className="card p-4 flex items-center gap-3 hover:shadow-md transition"
            >
              <div className="w-10 h-10 rounded-full bg-market-100 flex items-center justify-center font-display font-bold text-market-600 shrink-0">
                {c.business?.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{c.business?.name}</p>
                <p className="text-xs text-night/50 truncate">
                  {lastMessage ? lastMessage.body : 'No messages yet'}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}