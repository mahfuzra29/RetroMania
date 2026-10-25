import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  User,
  ArrowRight,
  Sparkles,
  Link as LinkIcon,
  X,
  Frown,
  CheckCircle2,
} from 'lucide-react';
import RetroCard from '../components/RetroCard';
import { sound } from '../utils/sound';

export default function ActionItemsView({
  roomState,
  isHost,
  participant,
  onCreateActionItem,
  onToggleActionItem,
  onDeleteActionItem,
  onCloseRoom,
}) {
  const [selectedCard, setSelectedCard] = useState(null);
  const [text, setText] = useState('');
  const [assignee, setAssignee] = useState('');

  // FR 4.1: Layar menampilkan daftar kartu dari sesi "Went Bad" yang diurutkan dari vote tertinggi.
  const wentBadCards = (roomState.cards || [])
    .filter((c) => c.type === 'went_bad')
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  const actionItems = roomState.actionItems || [];
  const participantList = Object.values(roomState.participants || {});

  const handleSelectCard = (card) => {
    sound.playPop();
    if (selectedCard?.id === card.id) {
      setSelectedCard(null);
    } else {
      setSelectedCard(card);
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sound.playPop();

    onCreateActionItem({
      text: text.trim(),
      relatedCardId: selectedCard ? selectedCard.id : null,
      assignee: assignee.trim() || 'Tim',
    });

    setText('');
    setSelectedCard(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Fase 4: Perumusan Action Items
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Solusi & Tindak Lanjut Masalah
          </h2>
          <p className="text-xs text-slate-400">
            Pilih kartu kendala di sebelah kiri untuk membuat tindak lanjut nyata bersama tim.
          </p>
        </div>

        {/* FR 5.1 Close Room & Generate Summary Button (Host only) */}
        {isHost && (
          <button
            onClick={() => {
              sound.playChime();
              onCloseRoom();
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition active:scale-95 shrink-0"
          >
            <span>Tutup Ruangan & Buat Ringkasan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2-Column Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: FR 4.1 Went Bad Review */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Frown className="w-4 h-4 text-rose-400" />
              <h3 className="font-bold text-sm text-slate-200">
                Review Masalah "Went Bad" (Urut Vote)
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              {wentBadCards.length} kartu
            </span>
          </div>

          {wentBadCards.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/40 text-xs text-slate-500">
              Tidak ada kartu "Went Bad" untuk ditinjau.
            </div>
          ) : (
            <div className="space-y-3">
              {wentBadCards.map((card, idx) => (
                <RetroCard
                  key={card.id}
                  card={card}
                  isVotingStage={false}
                  isActionItemsStage={true}
                  isSelectedForAction={selectedCard?.id === card.id}
                  onSelectForAction={handleSelectCard}
                  rank={idx + 1}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: FR 4.2 Create Action Item & FR 4.3 Action Items List */}
        <div className="lg:col-span-7 space-y-6">
          {/* FR 4.2: Create Action Item Form (Host Only) */}
          {isHost ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-indigo-400" />
                  Buat Action Item Baru
                </h3>

                {selectedCard && (
                  <button
                    onClick={() => setSelectedCard(null)}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded-lg bg-slate-800"
                  >
                    <X className="w-3 h-3" /> Batal kaitkan
                  </button>
                )}
              </div>

              {/* Selected Card Pill if linked */}
              {selectedCard && (
                <div className="mb-3 p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs flex items-center gap-2">
                  <LinkIcon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="text-indigo-300 font-medium truncate flex-1">
                    Terkait Masalah: "{selectedCard.content}"
                  </span>
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <textarea
                    rows={2}
                    required
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="cth. Setup automated integration test di CI/CD pipeline..."
                    className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  {/* Assignee select / input */}
                  <div className="w-full sm:w-1/2 flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={assignee}
                      onChange={(e) => setAssignee(e.target.value)}
                      placeholder="Penanggung Jawab (PIC)"
                      className="w-full bg-transparent text-xs text-white placeholder-slate-500 outline-none"
                      list="participants-datalist"
                    />
                    <datalist id="participants-datalist">
                      {participantList.map((p) => (
                        <option key={p.id} value={p.name} />
                      ))}
                      <option value="Tim / Bersama" />
                    </datalist>
                  </div>

                  <button
                    type="submit"
                    disabled={!text.trim()}
                    className="w-full sm:w-auto ml-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition active:scale-95 disabled:opacity-40 shadow-md shadow-indigo-600/20"
                  >
                    Tambah Action Item
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Host sedang merumuskan Action Items berdasarkan hasil voting tim.</span>
            </div>
          )}

          {/* FR 4.3: Action Items List */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Daftar Action Items ({actionItems.length})
              </h3>
            </div>

            {actionItems.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/40 text-xs text-slate-500">
                Belum ada Action Items yang dibuat.
              </div>
            ) : (
              <div className="space-y-2.5">
                {actionItems.map((ai) => (
                  <div
                    key={ai.id}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border transition ${
                      ai.completed
                        ? 'bg-emerald-950/10 border-emerald-500/20 text-slate-400'
                        : 'bg-slate-950/60 border-slate-800 text-slate-100 hover:border-slate-700'
                    }`}
                  >
                    <button
                      onClick={() => {
                        sound.playPop();
                        onToggleActionItem(ai.id);
                      }}
                      className="mt-0.5 text-slate-400 hover:text-emerald-400 transition"
                      title={ai.completed ? 'Tandai Belum' : 'Tandai Selesai'}
                    >
                      {ai.completed ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-medium ${
                          ai.completed ? 'line-through text-slate-500' : 'text-slate-100'
                        }`}
                      >
                        {ai.text}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {ai.assignee && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-indigo-300 border border-slate-700">
                            <User className="w-3 h-3" /> {ai.assignee}
                          </span>
                        )}

                        {ai.relatedCardContent && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 truncate max-w-xs bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                            <LinkIcon className="w-3 h-3 text-rose-400" /> Masalah: "{ai.relatedCardContent}"
                          </span>
                        )}
                      </div>
                    </div>

                    {isHost && (
                      <button
                        onClick={() => {
                          sound.playPop();
                          onDeleteActionItem(ai.id);
                        }}
                        className="text-slate-500 hover:text-rose-400 transition p-1"
                        title="Hapus Action Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
