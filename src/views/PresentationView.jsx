import React, { useState } from 'react';
import { ShieldCheck, Smile, Frown, Users, ExternalLink, Lock, RotateCw } from 'lucide-react';
import Timer from '../components/Timer';
import SubmissionTracker from '../components/SubmissionTracker';
import RetroCard from '../components/RetroCard';
import { sound } from '../utils/sound';

export default function PresentationView({
  roomState,
  isHost,
  onAddTime,
  onEndEarly,
  onOpenPopout,
  isStandalone = false,
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isWentWell = roomState.stage === 'went_well_submission';
  const cardType = isWentWell ? 'went_well' : 'went_bad';
  const stageName = isWentWell ? 'What Went Well' : 'What Went Bad';

  const handleRefresh = () => {
    sound.playPop();
    setIsRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 250);
  };

  // Filter cards for this stage
  const currentStageCards = (roomState.cards || []).filter((c) => c.type === cardType);

  return (
    <div className={`space-y-6 ${isStandalone ? 'max-w-7xl mx-auto px-4 py-8' : ''}`}>
      {/* Share Screen Safe Banner */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/80 border border-indigo-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white block">
                Layar Presentasi Publik (Aman untuk Share Screen)
              </span>
              {isStandalone && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  Tab Terpisah
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Semua kartu disembunyikan secara seragam. Anda dapat membagikan layar ini di Google Meet/Zoom tanpa khawatir masukan Anda bocor.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Tombol Refresh Layar */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition active:scale-95 shadow-sm disabled:opacity-50"
            title="Muat ulang dan sinkronkan data layar presentasi"
          >
            <RotateCw className={`w-3.5 h-3.5 text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Memperbarui...' : 'Refresh Layar'}</span>
          </button>

          {onOpenPopout && (
            <button
              onClick={onOpenPopout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition active:scale-95"
              title="Buka Layar Presentasi di Tab Baru agar bisa share screen sambil mengetik di tab utama"
            >
              <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
              <span>Buka di Tab Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Timer & Host Controls */}
      <Timer
        stageEndsAt={roomState.stageEndsAt}
        totalMinutes={roomState.sessionDurationMinutes}
        isHost={isHost}
        onAddTime={onAddTime}
        onEndEarly={onEndEarly}
      />

      {/* Submission Tracker (NO card count per participant) */}
      <SubmissionTracker
        participants={roomState.participants}
        submissionTracker={roomState.submissionTracker}
        currentStage={roomState.stage}
      />

      {/* Live Board Header */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isWentWell
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}
          >
            {isWentWell ? <Smile className="w-5 h-5" /> : <Frown className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">
              Papan Masukan Tim: {stageName}
            </h3>
            <p className="text-xs text-slate-400">
              Setiap kartu yang dikirim akan muncul di papan ini secara terenkripsi/tertutup hingga sesi berakhir.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-800 text-indigo-300 border border-slate-700">
            {currentStageCards.length} Kartu Terkumpul
          </span>
        </div>
      </div>

      {/* Masked Live Cards Board */}
      {currentStageCards.length === 0 ? (
        <div className="text-center py-16 px-4 border border-dashed border-slate-800 rounded-3xl bg-slate-900/40">
          <Lock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-300 mb-1">
            Menunggu masukan dari anggota tim...
          </p>
          <p className="text-xs text-slate-500">
            Semua kartu yang dikirim akan berstatus tertutup dan anonim di layar ini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentStageCards.map((card) => (
            <RetroCard
              key={card.id}
              card={card}
              isVotingStage={false}
              forceMasked={true} // FORCED MASKED: Guarantees Host's own card text is NEVER displayed on the share screen board!
            />
          ))}
        </div>
      )}
    </div>
  );
}
