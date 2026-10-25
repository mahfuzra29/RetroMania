import React from 'react';
import { X, Users, Crown, Circle, CheckCircle2 } from 'lucide-react';

export default function ParticipantsModal({ isOpen, onClose, participants = {}, submissionTracker = {}, currentStage }) {
  if (!isOpen) return null;

  const list = Object.values(participants);
  const isWentWell = currentStage === 'went_well_submission' || currentStage === 'went_well_voting';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base text-white">Daftar Peserta ({list.length})</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {list.map((p) => {
            const stats = submissionTracker[p.id];
            const hasSubmitted = isWentWell ? stats?.hasSubmittedWentWell : stats?.hasSubmittedWentBad;
            const count = isWentWell ? stats?.wentWellCount || 0 : stats?.wentBadCount || 0;

            return (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      p.online ? 'bg-emerald-500' : 'bg-slate-600'
                    }`}
                    title={p.online ? 'Online' : 'Offline'}
                  />
                  <span className="font-semibold text-slate-200 truncate">{p.name}</span>
                  {p.isHost && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                      <Crown className="w-3 h-3" /> Host
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {hasSubmitted ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-medium text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Sudah kirim
                    </span>
                  ) : (
                    <span className="text-slate-500 text-[11px]">Belum input</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
