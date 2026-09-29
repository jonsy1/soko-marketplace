'use client';

import { useEffect, useState } from 'react';

export default function EmailSellersPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [mode, setMode] = useState<'individual' | 'broadcast'>('individual');
  const [businessId, setBusinessId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/businesses')
      .then((r) => r.json())
      .then((data) => setBusinesses(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  async function handleSend() {
    setError('');
    setResult('');
    if (!subject.trim() || !message.trim()) {
      setError('Subject and message are required.');
      return;
    }
    if (mode === 'individual' && !businessId) {
      setError('Choose a seller to email.');
      return;
    }
    if (mode === 'broadcast') {
      const confirmed = confirm(
        `This will email ALL ${businesses.length} sellers. Are you sure?`
      );
      if (!confirmed) return;
    }

    setSending(true);
    const res = await fetch('/api/admin/email-sellers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, businessId, subject, message }),
    });
    const data = await res.json();
    setSending(false);

    if (!res.ok) {
      setError(data.error || 'Could not send email.');
      return;
    }
    setResult(`Sent to ${data.sent} of ${data.total} seller(s).`);
    setSubject('');
    setMessage('');
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold mb-6">Email sellers</h1>

      <div className="card p-5 space-y-4">
        <div>
          <label className="label mb-2">Recipients</label>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('individual')}
              className={`btn text-xs flex-1 ${mode === 'individual' ? 'btn-secondary' : 'btn-outline'}`}
            >
              One seller
            </button>
            <button
              onClick={() => setMode('broadcast')}
              className={`btn text-xs flex-1 ${mode === 'broadcast' ? 'btn-secondary' : 'btn-outline'}`}
            >
              All sellers ({businesses.length})
            </button>
          </div>
        </div>

        {mode === 'individual' && (
          <div>
            <label className="label">Choose seller</label>
            <select className="input" value={businessId} onChange={(e) => setBusinessId(e.target.value)}>
              <option value="">Select a business...</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.owner?.email || 'no email'})
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="label">Subject</label>
          <input
            type="text"
            className="input"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Important update about Soko fees"
          />
        </div>

        <div>
          <label className="label">Message</label>
          <textarea
            className="input"
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message here..."
          />
        </div>

        {error && <div className="text-sm bg-clay-50 text-clay-600 px-3 py-2 rounded-card">{error}</div>}
        {result && <div className="text-sm bg-teal-50 text-teal-600 px-3 py-2 rounded-card">{result}</div>}

        <button onClick={handleSend} disabled={sending} className="btn btn-primary w-full">
          {sending ? 'Sending...' : mode === 'broadcast' ? `Send to all ${businesses.length} sellers` : 'Send email'}
        </button>
      </div>
    </div>
  );
}