import React, { useState } from 'react';
import { Users, Crown, Play, Share2, Check, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';

export default function LobbyView({ roomState, isHost, participant, onStartSession }) {
  const [copied, setCopied] = useState(false);
  const participantsList = Object.values(roomState.participants || {});
  const onlineCount = participantsList.filter((p) => p.online).length;

  const copyInviteLink = () => {
    const url = `${window.location.origin}/?room=${roomState.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      sound.playPop();
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/20 rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Lobby Ruangan Retrospektif
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            {roomState.name}
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mb-6">
            Menunggu semua anggota tim berkumpul di ruangan. Setiap sesi akan berdurasi{' '}
            <span className="font-semibold text-indigo-300 font-mono">
              {roomState.sessionDurationMinutes} menit
            </span>
            .
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {/* Share Link Button */}
            <button
              onClick={copyInviteLink}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition border ${
                copied
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-white hover:bg-slate-100 text-slate-900 border-white shadow-lg shadow-white/10'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Tautan Tersalin ke Clipboard!' : 'Salin Tautan Undangan'}</span>
            </button>

            {/* Start Session Button (Host only, FR 1.5) */}
            {isHost ? (
              <button
                onClick={() => {
                  sound.playBell();
                  onStartSession();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/25 transition active:scale-95"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Mulai Sesi Sekarang</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>Menunggu Host memulai sesi...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Real-time Presence Grid (FR 1.4) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base text-white">Peserta yang Sudah Bergabung</h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-emerald-300 border border-slate-700">
            {onlineCount} Online
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {participantsList.map((p) => {
            const isMe = p.id === participant.id;
            return (
              <div
                key={p.id}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
                  isMe
                    ? 'bg-indigo-950/30 border-indigo-500/40'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Avatar with Status Indicator */}
                <div className="relative">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                      p.isHost
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : isMe
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {getInitials(p.name)}
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
                      p.online ? 'bg-emerald-500' : 'bg-slate-500'
                    }`}
                    title={p.online ? 'Online' : 'Offline'}
                  />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-slate-100 truncate">{p.name}</p>
                    {isMe && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                        Anda
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    {p.isHost ? (
                      <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                        <Crown className="w-3 h-3" /> Host
                      </span>
                    ) : (
                      <span>Anggota Tim</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {participantsList.length === 1 && (
          <div className="mt-6 text-center py-6 px-4 border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
            <p className="text-xs text-slate-400 mb-2">
              Anda baru sendirian di dalam ruangan ini.
            </p>
            <p className="text-xs text-indigo-400 font-medium">
              Bagikan tautan ruangan kepada rekan tim Anda agar mereka dapat bergabung!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
