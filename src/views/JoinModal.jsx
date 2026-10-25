import React, { useState } from 'react';
import { User, ArrowRight, ShieldCheck } from 'lucide-react';
import { sound } from '../utils/sound';

export default function JoinModal({ roomName, onJoin }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    sound.playPop();
    onJoin(name.trim());
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto mb-3">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">
            Bergabung ke Retrospektif
          </h2>
          <p className="text-sm text-slate-400 font-medium">
            Ruangan: <span className="text-indigo-300 font-semibold">{roomName || 'Retro Session'}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Nama Tampilan (Display Name)
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="cth. Sarah (Frontend Dev)"
              className="w-full px-4 py-3 bg-slate-950/70 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition"
            />
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Kartu masukan Anda akan selalu berstatus anonim saat sesi berlangsung.</span>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition active:scale-[0.98]"
          >
            <span>Masuk ke Ruangan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
