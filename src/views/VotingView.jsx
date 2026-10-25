import React, { useState } from 'react';
import { ArrowRight, Sparkles, Smile, Frown, Flame, SortDesc, CheckCircle2 } from 'lucide-react';
import RetroCard from '../components/RetroCard';
import { sound } from '../utils/sound';

export default function VotingView({
  roomState,
  isHost,
  participant,
  onVote,
  onNextStage,
}) {
  const [sortByVotes, setSortByVotes] = useState(true);
  const isWentWell = roomState.stage === 'went_well_voting';
  const cardType = isWentWell ? 'went_well' : 'went_bad';

  let cards = (roomState.cards || []).filter((c) => c.type === cardType);

  if (sortByVotes) {
    cards = [...cards].sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  const nextDestinationTitle = isWentWell
    ? 'Lanjut ke Sesi "What Went Bad"'
    : 'Lanjut ke Sesi "Action Items"';

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Banner: Evaluasi & Voting */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isWentWell
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}
          >
            {isWentWell ? <Smile className="w-6 h-6" /> : <Frown className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Fase 3: Evaluasi & Voting
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              {isWentWell ? 'Evaluasi Kartu "Went Well"' : 'Evaluasi Kartu "Went Bad"'}
            </h2>
            <p className="text-xs text-slate-400">
              Semua kartu telah dibuka! Berikan upvote (👍) atau downvote (👎) pada kartu yang paling mewakili suara Anda.
            </p>
          </div>
        </div>

        {/* Next Stage Button (Host Only FR 3.4) */}
        {isHost ? (
          <button
            onClick={() => {
              sound.playChime();
              onNextStage();
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition active:scale-95 shrink-0"
          >
            <span>{nextDestinationTitle}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="text-xs text-slate-400 bg-slate-950/50 px-3.5 py-2 rounded-xl border border-slate-800">
            Menunggu Host melanjutkan ke tahap berikutnya...
          </div>
        )}
      </div>

      {/* Sorting Control FR 3.3 */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800/80 px-4 py-2.5 rounded-2xl">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Flame className="w-4 h-4 text-amber-400" />
          <span>
            Total <strong className="text-white">{cards.length}</strong> kartu masukan
          </span>
        </div>

        <button
          onClick={() => setSortByVotes(!sortByVotes)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition"
        >
          <SortDesc className="w-3.5 h-3.5 text-indigo-400" />
          <span>{sortByVotes ? 'Urutan: Vote Terbanyak' : 'Urutan: Waktu Input'}</span>
        </button>
      </div>

      {/* Cards Grid FR 3.1, FR 3.2, FR 3.3 */}
      {cards.length === 0 ? (
        <div className="text-center py-16 px-4 border border-dashed border-slate-800 rounded-3xl bg-slate-900/40">
          <p className="text-sm text-slate-400 mb-1">Tidak ada kartu yang dikirim pada sesi ini.</p>
          <p className="text-xs text-slate-500">
            Host dapat langsung menekan tombol Lanjut di kanan atas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card, idx) => (
            <RetroCard
              key={card.id}
              card={card}
              isVotingStage={true}
              onVote={onVote}
              rank={sortByVotes ? idx + 1 : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
