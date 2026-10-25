import React, { useState } from 'react';
import { Sparkles, Clock, Users, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { sound } from '../utils/sound';

export default function HomeView({ onCreateRoom, isCreating }) {
  const [roomName, setRoomName] = useState('');
  const [hostName, setHostName] = useState('');
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState(3);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!roomName.trim() || !hostName.trim()) return;
    sound.playPop();
    onCreateRoom({
      name: roomName,
      sessionDurationMinutes: Number(sessionDurationMinutes),
      hostName,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-center items-center px-4 py-12">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-xl shadow-indigo-500/25 text-white font-extrabold text-2xl mb-4">
            R
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            RetroTools
          </h1>
          <p className="text-sm text-slate-400">
            Aplikasi retrospektif tim real-time, anonim, dan tanpa ribet.
          </p>
        </div>

        {/* Create Room Form (FR 1.1) */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Nama Ruangan (Room Name)
              </label>
              <input
                type="text"
                required
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="cth. Sprint 42 Retrospective"
                className="w-full px-4 py-3 bg-slate-950/70 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Nama Anda (Host)
              </label>
              <input
                type="text"
                required
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="cth. Budi (Scrum Master)"
                className="w-full px-4 py-3 bg-slate-950/70 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Waktu Per Sesi (Menit)
                </label>
                <span className="text-xs font-mono font-bold text-indigo-400">
                  {sessionDurationMinutes} Menit
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[2, 3, 5, 10].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setSessionDurationMinutes(mins)}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      sessionDurationMinutes === mins
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-50"
            >
              <span>{isCreating ? 'Membuat Ruangan...' : 'Buat Ruangan & Masuk'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Value Props */}
          <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-400">
            <div className="flex flex-col items-center gap-1">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Tanpa Login</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Anonim</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Real-time Sync</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
