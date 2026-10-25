import React, { useState } from 'react';
import { Share2, Check, Users, Volume2, VolumeX, Crown, Shield, RotateCw, Tv } from 'lucide-react';
import { sound } from '../utils/sound';

export default function Header({ roomState, isHost, participant, onOpenParticipantsModal, isPresentationView }) {
  const [copied, setCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    sound.playPop();
    setIsRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 250);
  };

  const copyInviteLink = () => {
    const url = `${window.location.origin}/?room=${roomState.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      sound.playPop();
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const toggleMute = () => {
    sound.muted = !sound.muted;
    setIsMuted(sound.muted);
  };

  const stages = [
    { key: 'lobby', label: 'Lobby' },
    { key: 'went_well_submission', label: 'Went Well' },
    { key: 'went_well_voting', label: 'Voting 1' },
    { key: 'went_bad_submission', label: 'Went Bad' },
    { key: 'went_bad_voting', label: 'Voting 2' },
    { key: 'action_items', label: 'Action Items' },
    { key: 'summary', label: 'Ringkasan' },
  ];

  const currentStageIndex = stages.findIndex((s) => s.key === roomState.stage);
  const onlineCount = Object.values(roomState.participants || {}).filter((p) => p.online).length;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Left: Brand & Room Name */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-md shadow-indigo-500/20 text-white font-black text-lg">
              R
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg truncate text-white" title={roomState.name}>
                  {roomState.name}
                </h1>
                {isPresentationView && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold">
                    <Tv className="w-3 h-3 text-indigo-400" /> Share Screen
                  </span>
                )}
                {isHost && !isPresentationView && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium">
                    <Crown className="w-3 h-3" /> Host
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate">
                ID Ruangan: <span className="font-mono text-slate-300 font-semibold">{roomState.id}</span>
              </p>
            </div>
          </div>

          {/* Center: Stage Progress (Hidden on mobile) */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80">
            {stages.map((st, idx) => {
              const isActive = st.key === roomState.stage;
              const isPast = currentStageIndex > idx;
              return (
                <div
                  key={st.key}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                      : isPast
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-600'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      isActive
                        ? 'bg-white text-indigo-700 font-bold'
                        : isPast
                        ? 'bg-slate-800 text-slate-300'
                        : 'bg-slate-900 text-slate-600'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span>{st.label}</span>
                </div>
              );
            })}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Tombol Refresh Khusus Layar Share Screen / Standalone */}
            {isPresentationView && (
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs font-bold transition active:scale-95 disabled:opacity-50"
                title="Muat Ulang / Refresh Layar Presentasi"
              >
                <RotateCw className={`w-3.5 h-3.5 text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Memuat...' : 'Refresh'}</span>
              </button>
            )}

            {/* Participant presence button */}
            <button
              onClick={onOpenParticipantsModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-xs font-medium text-slate-200 transition border border-slate-700/60"
              title="Lihat Peserta"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>{onlineCount} Online</span>
            </button>

            {/* Share link button FR 1.2 */}
            <button
              onClick={copyInviteLink}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-indigo-600/90 hover:bg-indigo-600 text-white border-indigo-500/40 shadow-sm shadow-indigo-600/20'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Tersalin!' : 'Undang Tim'}</span>
            </button>

            {/* Sound toggle */}
            <button
              onClick={toggleMute}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 transition border border-slate-700/60"
              title={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-slate-300" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
