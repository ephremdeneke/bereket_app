import React, { useState } from 'react';
import { Sheet, Link, Check, AlertCircle, RefreshCw, X } from 'lucide-react';
import { getScriptUrl, setScriptUrl, testScriptConnection } from '../../services/api';

export const SettingsModal = ({ isOpen, onClose, onUrlUpdated, showToast }) => {
  const [url, setUrl] = useState(getScriptUrl());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setScriptUrl(url);
    onUrlUpdated();
    showToast({ type: 'success', message: 'API connection settings saved successfully!' });
    onClose();
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await testScriptConnection(url);
    setTesting(false);
    setTestResult(res);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl">
              <Sheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Google Sheets Connection</h3>
              <p className="text-xs text-slate-500 font-medium">Link your Google Apps Script backend</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Google Apps Script Web App URL
            </label>
            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-mono"
              />
              <Link className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>
            <p className="mt-1.5 text-xs text-slate-500 leading-normal">
              Leave blank to use the Web App URL from <code className="bg-slate-100 px-1 rounded">.env</code>. Deploy your script with access permissions set to <strong>"Anyone"</strong>.
            </p>
          </div>

          {testResult && (
            <div className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
              testResult.success 
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}>
              {testResult.success ? <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />}
              <div>
                <p className="font-bold">{testResult.success ? 'Connection Successful!' : 'Connection Failed'}</p>
                <p className="mt-0.5 text-slate-600">{testResult.message}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing || !url}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-xl transition-colors flex items-center gap-2"
            >
              {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sheet className="w-3.5 h-3.5" />}
              <span>Test Connection</span>
            </button>

          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold bg-amber-800 hover:bg-amber-900 text-white rounded-xl shadow-xs transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
