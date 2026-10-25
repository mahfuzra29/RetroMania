import React from 'react';
import { ThumbsUp, ThumbsDown, Trash2, Lock, Sparkles, Check, Link as LinkIcon } from 'lucide-react';
import { sound } from '../utils/sound';

export default function RetroCard({
  card,
  isVotingStage,
  isActionItemsStage,
  onVote,
  onDelete,
  onSelectForAction,
  isSelectedForAction,
  rank,
  forceMasked = false,
}) {
  const isWentWell = card.type === 'went_well';
  const isMasked = forceMasked || card.isMasked;
  const isMine = !forceMasked && card.isMine;

  const handleVote = (e, value) => {
    e.stopPropagation();
    sound.playVote();
    if (onVote) onVote(card.id, value);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    sound.playPop();
    if (onDelete) onDelete(card.id);
  };

  // Border & Accent Color depending on card type
  const themeClasses = isWentWell
    ? 'border-emerald-500/20 bg-emerald-950/20 hover:border-emerald-500/40 text-emerald-100'
    : 'border-rose-500/20 bg-rose-950/20 hover:border-rose-500/40 text-rose-100';

  const selectedClasses = isSelectedForAction
    ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-950/30'
    : '';

  return (
    <div
      onClick={isActionItemsStage ? () => onSelectForAction(card) : undefined}
      className={`group relative rounded-2xl p-4.5 border transition-all duration-200 shadow-md ${themeClasses} ${selectedClasses} ${
        isActionItemsStage ? 'cursor-pointer hover:scale-[1.01]' : ''
      }`}
    >
      {/* Top row: Rank badge / Anonymous badge / Delete */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          {rank && rank <= 3 && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                rank === 1
                  ? 'bg-amber-400 text-slate-950'
                  : rank === 2
                  ? 'bg-slate-300 text-slate-950'
                  : 'bg-amber-700 text-white'
              }`}
            >
              #{rank} Teratas
            </span>
          )}

          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
            {isMasked ? (
              <span className="flex items-center gap-1 text-amber-400">
                <Lock className="w-3 h-3" /> Masukan Tersembunyi
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> Anonim
              </span>
            )}
          </span>
        </div>

        {/* Delete button (only if author created it and not on presentation board) */}
        {isMine && onDelete && (
          <button
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 transition p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
            title="Hapus Kartu Saya"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Card Body */}
      <div className="min-h-[50px] mb-3">
        {isMasked ? (
          <div className="flex items-center gap-2 text-slate-400 italic text-sm py-2">
            <Lock className="w-4 h-4 text-amber-400/70" />
            <span>Disembunyikan hingga sesi berakhir</span>
          </div>
        ) : (
          <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap text-slate-100">
            {card.content}
          </p>
        )}
      </div>

      {/* Bottom Row: Voting Controls / Action Item Selection */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
        {/* Voting UI FR 3.2 */}
        {isVotingStage && !isMasked ? (
          <div className="flex items-center gap-1.5">
            {/* Upvote Button */}
            <button
              onClick={(e) => handleVote(e, 1)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition active:scale-90 ${
                card.myVote === 1
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Upvote (Suka)"
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${card.myVote === 1 ? 'fill-slate-950' : ''}`} />
              <span>{card.upvotes || 0}</span>
            </button>

            {/* Downvote Button */}
            <button
              onClick={(e) => handleVote(e, -1)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition active:scale-90 ${
                card.myVote === -1
                  ? 'bg-rose-500 text-white font-bold shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Downvote (Kurang Suka)"
            >
              <ThumbsDown className={`w-3.5 h-3.5 ${card.myVote === -1 ? 'fill-white' : ''}`} />
              <span>{card.downvotes || 0}</span>
            </button>
          </div>
        ) : (
          <div className="text-xs text-slate-500 font-mono">
            {isMine ? <span className="text-indigo-400 font-medium">Kartu Anda</span> : ''}
          </div>
        )}

        {/* Total Score FR 3.3 */}
        {isVotingStage && !isMasked && (
          <div className="flex items-center gap-1 font-mono text-xs font-bold">
            <span className="text-slate-400">Skor:</span>
            <span
              className={
                card.score > 0
                  ? 'text-emerald-400'
                  : card.score < 0
                  ? 'text-rose-400'
                  : 'text-slate-400'
              }
            >
              {card.score > 0 ? `+${card.score}` : card.score}
            </span>
          </div>
        )}

        {/* Action item select indicator in Action Items stage FR 4.2 */}
        {isActionItemsStage && (
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-slate-400 font-mono">
              Skor: <span className="font-bold text-rose-400">{card.score || 0}</span>
            </div>
            <span
              className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-semibold transition ${
                isSelectedForAction
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 group-hover:bg-indigo-600/30'
              }`}
            >
              <LinkIcon className="w-3 h-3" />
              {isSelectedForAction ? 'Terpilih' : 'Buat Solusi'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
