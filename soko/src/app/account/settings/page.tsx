'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import PasswordInput from '@/components/PasswordInput';

export default function AccountSettingsPage() {
  const { data: session, status, update } = useSession();
  const [profile, setProfile] = useState<any>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailMsg, setEmailMsg] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordErr, setPasswordErr] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/account')
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setName(data.name || '');
        setPhone(data.phone || '');
        setNewEmail(data.email || '');
      });
  }, [status]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileErr('');
    setProfileMsg('');
    setSavingProfile(true);
    const res = await fetch('/api/account', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone }),
    });
    const data = await res.json();
    setSavingProfile(false);
    if (!res.ok) {
      setProfileErr(data.error || 'Could not save changes.');
      return;
    }
    setProfileMsg('Saved.');
    update({ name });
  }

  async function saveEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailErr('');
    setEmailMsg('');
    setSavingEmail(true);
    const res = await fetch('/api/account/email', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newEmail, currentPassword: emailPassword }),
    });
    const data = await res.json();
    setSavingEmail(false);
    if (!res.ok) {
      setEmailErr(data.error || 'Could not update email.');
      return;
    }
    setEmailMsg('Email updated. Use your new email next time you log in.');
    setEmailPassword('');
    setProfile((p: any) => ({ ...p, email: newEmail }));
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordErr('');
    setPasswordMsg('');
    if (newPassword !== confirmPassword) {
      setPasswordErr('New passwords do not match.');
      return;
    }
    setSavingPassword(true);
    const res = await fetch('/api/account/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    setSavingPassword(false);
    if (!res.ok) {
      setPasswordErr(data.error || 'Could not update password.');
      return;
    }
    setPasswordMsg(profile?.hasPassword ? 'Password updated.' : 'Password set. You can now log in with email and password too.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setProfile((p: any) => ({ ...p, hasPassword: true }));
  }

  if (status === 'loading' || !profile) {
    return <div className="max-w-md mx-auto px-4 py-16 text-night/50">Loading…</div>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-night/60 mb-4">Log in to manage your account.</p>
        <Link href="/login?callbackUrl=/account/settings" className="btn btn-primary">
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10 space-y-6">
      <div>
        <Link href="/account" className="text-sm text-teal-600 font-semibold">
          ← My Account
        </Link>
        <h1 className="font-display text-2xl font-bold mt-2">Account Settings</h1>
      </div>

      {/* Profile info */}
      <form onSubmit={saveProfile} className="card p-5 space-y-4">
        <h2 className="font-semibold">Profile</h2>
        {profileErr && <div className="text-sm bg-clay/10 text-clay px-3 py-2 rounded-card">{profileErr}</div>}
        {profileMsg && <div className="text-sm bg-teal-50 text-teal-600 px-3 py-2 rounded-card">{profileMsg}</div>}
        <div>
          <label className="label">Full name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 0712 345 678" />
        </div>
        <button className="btn btn-primary w-full" disabled={savingProfile}>
          {savingProfile ? 'Saving…' : 'Save profile'}
        </button>
      </form>

      {/* Email */}
      <form onSubmit={saveEmail} className="card p-5 space-y-4">
        <h2 className="font-semibold">Email address</h2>
        <p className="text-xs text-night/50">Current: {profile.email}</p>
        {emailErr && <div className="text-sm bg-clay/10 text-clay px-3 py-2 rounded-card">{emailErr}</div>}
        {emailMsg && <div className="text-sm bg-teal-50 text-teal-600 px-3 py-2 rounded-card">{emailMsg}</div>}
        <div>
          <label className="label">New email</label>
          <input
            type="email"
            className="input"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
          />
        </div>
        {profile.hasPassword && (
          <div>
            <label className="label">Current password (to confirm)</label>
            <PasswordInput
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
              required
            />
          </div>
        )}
        <button className="btn btn-primary w-full" disabled={savingEmail}>
          {savingEmail ? 'Saving…' : 'Update email'}
        </button>
      </form>

      {/* Password */}
      <form onSubmit={savePassword} className="card p-5 space-y-4">
        <h2 className="font-semibold">{profile.hasPassword ? 'Change password' : 'Set a password'}</h2>
        {!profile.hasPassword && (
          <p className="text-xs text-night/50">
            Your account currently signs in with Google only. Set a password to also log in with your email.
          </p>
        )}
        {passwordErr && <div className="text-sm bg-clay/10 text-clay px-3 py-2 rounded-card">{passwordErr}</div>}
        {passwordMsg && <div className="text-sm bg-teal-50 text-teal-600 px-3 py-2 rounded-card">{passwordMsg}</div>}
        {profile.hasPassword && (
          <div>
            <label className="label">Current password</label>
            <PasswordInput
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
        )}
        <div>
          <label className="label">New password</label>
          <PasswordInput
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>
        <div>
          <label className="label">Confirm new password</label>
          <PasswordInput
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>
        <button className="btn btn-primary w-full" disabled={savingPassword}>
          {savingPassword ? 'Saving…' : profile.hasPassword ? 'Update password' : 'Set password'}
        </button>
      </form>
    </div>
  );
}