import React, { useState } from 'react';
import { Sheet, Copy, Check, ExternalLink, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { GOOGLE_APPS_SCRIPT_CODE } from '../services/googleAppsScriptCode';
import { getScriptUrl, setScriptUrl, testScriptConnection } from '../services/api';

export const AppsScriptSetup = ({ showToast }) => {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState(getScriptUrl());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopied(true);
    showToast({ type: 'success', message: 'Google Apps Script code copied to clipboard!' });
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSaveUrl = async (e) => {
    e.preventDefault();
    setScriptUrl(url);
    showToast({ type: 'success', message: 'Google Apps Script Web App URL saved!' });
    handleTestConnection();
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await testScriptConnection(url);
    setTesting(false);
    setTestResult(res);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-950 p-6 rounded-2xl text-white shadow-lg space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-400/30">
            <Sheet className="w-7 h-7 text-emerald-300" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">Google Sheets Database Backend Integration</h2>
            <p className="text-xs text-emerald-200 mt-0.5">
              Connect your moshaga Cafe Manager directly to your Google Sheet database
            </p>
          </div>
        </div>

        <div className="p-3 bg-black/20 rounded-xl border border-white/10 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-emerald-100 font-mono">
            <span className="font-bold text-amber-400">Target Google Sheet:</span>
            <span className="truncate max-w-md">https://docs.google.com/spreadsheets/d/1QKC8zPRQS2UG5nijS4oZw_2hoHZKGWLeoghlUpzqXhk/edit</span>
          </div>

          <a
            href="https://docs.google.com/spreadsheets/d/1QKC8zPRQS2UG5nijS4oZw_2hoHZKGWLeoghlUpzqXhk/edit?usp=sharing"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold transition-colors inline-flex items-center gap-1 shrink-0"
          >
            <span>Open Google Sheet</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Connection Config Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Step 3: Connect Deployed Web App URL</h3>
        <form onSubmit={handleSaveUrl} className="space-y-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Google Apps Script Web App URL
            </label>
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-mono"
            />
          </div>

          {testResult && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              testResult.success 
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}>
              {testResult.success ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              Save & Test Connection
            </button>

            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing || !url}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sheet className="w-3.5 h-3.5" />}
              <span>Test Ping</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3 Step Setup Walkthrough */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        <h3 className="text-lg font-bold text-slate-900">Setup Instructions (3 Simple Steps)</h3>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <span className="w-7 h-7 rounded-xl bg-amber-800 text-white font-extrabold text-sm flex items-center justify-center shrink-0">1</span>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">Open Apps Script in your Google Sheet</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Open your Google Sheet, click <strong>Extensions</strong> in the top menu bar, and select <strong>Apps Script</strong>.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <span className="w-7 h-7 rounded-xl bg-amber-800 text-white font-extrabold text-sm flex items-center justify-center shrink-0">2</span>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">Paste Code.gs & Run Setup</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Delete existing contents in <code className="bg-slate-200 px-1 py-0.5 rounded">Code.gs</code>, paste the backend code from below using the <strong>Copy Entire Backend Code</strong> button, and click <strong>Save (Ctrl+S)</strong>.
                Do <strong>not</strong> paste the raw <code className="bg-slate-200 px-1 py-0.5 rounded">googleAppsScriptCode.js</code> file, and do not include any <code className="bg-slate-200 px-1 py-0.5 rounded">export const ...</code> line.
                Then select <code className="bg-slate-200 px-1 py-0.5 rounded">setupDatabaseSheets</code> in the function dropdown and click <strong>Run</strong> once to create all database sheets, including <strong>Users</strong>. The default admin login is <code className="bg-slate-200 px-1 py-0.5 rounded">admin</code> / <code className="bg-slate-200 px-1 py-0.5 rounded">admin123</code>.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <span className="w-7 h-7 rounded-xl bg-amber-800 text-white font-extrabold text-sm flex items-center justify-center shrink-0">3</span>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">Deploy as Web App</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Click <strong>Deploy &gt; New deployment</strong>. Choose type <strong>Web App</strong>. Set <i>Execute as</i> to <strong>Me</strong> and <i>Who has access</i> to <strong>Anyone</strong>. Click <strong>Deploy</strong> and copy the Web App URL into the box above.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Code Viewer Section */}
      <div className="bg-slate-900 rounded-2xl p-6 text-slate-100 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Google Apps Script Code (Code.gs)</h3>
          </div>

          <button
            onClick={handleCopyCode}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Entire Backend Code'}</span>
          </button>
        </div>

        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold">
          Important: paste only the backend Apps Script code. Do not include `export const GOOGLE_APPS_SCRIPT_CODE = \`` or the closing `` `; `` lines from the React source file.
        </div>

        <pre className="p-4 bg-slate-950 rounded-xl text-xs text-emerald-400 font-mono overflow-x-auto max-h-96 leading-relaxed border border-slate-800">
          {GOOGLE_APPS_SCRIPT_CODE}
        </pre>
      </div>
    </div>
  );
};
