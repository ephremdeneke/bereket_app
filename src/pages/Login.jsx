import React, { useState } from 'react';
import { Sheet, AlertCircle, LogIn } from 'lucide-react';
import { api } from '../services/api';
import { setCurrentUser } from '../utils/auth';

export const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await api.login(username, password);
      setCurrentUser(user);
      onLogin(user);
    } catch (err) {
      setError(err.message || 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-amber-800 text-white">
            <Sheet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">moshaga Cafe Manager</h1>
            <p className="text-xs text-slate-500 mt-0.5">Sign in with your Apps Script user</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2.5 bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
          </button>
        </form>

        <p className="mt-4 text-[11px] text-slate-500 leading-relaxed">
          Default setup creates <code className="bg-slate-100 px-1 rounded">admin</code> / <code className="bg-slate-100 px-1 rounded">admin123</code>. Change this password after first login by adding a new user from the Users sheet.
        </p>
      </div>
    </div>
  );
};
