import React from 'react';
import { CheckCircle2, Circle, Users, Sparkles } from 'lucide-react';

export default function SubmissionTracker({ participants = {}, submissionTracker = {}, currentStage }) {
  const participantList = Object.values(participants);
  const isWentWell = currentStage === 'went_well_submission';
  const stageName = isWentWell ? 'Went Well' : 'Went Bad';

  const submittedCount = participantList.filter((p) => {
    const stats = submissionTracker[p.id];
    return isWentWell ? stats?.hasSubmittedWentWell : stats?.hasSubmittedWentBad;
  }).length;

  const totalParticipants = participantList.length;
  const percentage = totalParticipants > 0 ? Math.round((submittedCount / totalParticipants) * 100) : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-200">
            Pelacak Masukan ({stageName})
          </h3>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
          {submittedCount} / {totalParticipants} Sudah Kirim ({percentage}%)
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 rounded-full h-1.5 mb-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-1.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Participant List with Checkmarks (FR 2.3) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {participantList.map((p) => {
          const stats = submissionTracker[p.id];
          const hasSubmitted = isWentWell ? stats?.hasSubmittedWentWell : stats?.hasSubmittedWentBad;

          return (
            <div
              key={p.id}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs transition-all ${
                hasSubmitted
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-slate-800/40 border-slate-800 text-slate-400'
              }`}
            >
              {hasSubmitted ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              )}
              <span className="truncate font-medium">{p.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
