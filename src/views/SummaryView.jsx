import React, { useEffect } from 'react';
import {
  Printer,
  Sparkles,
  CheckCircle2,
  Smile,
  Frown,
  Users,
  Calendar,
  Clock,
  User,
  Share2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/sound';

export default function SummaryView({ roomState }) {
  useEffect(() => {
    // Confetti celebration on entering summary!
    sound.playChime();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const actionItems = roomState.actionItems || [];
  const wentWellCards = (roomState.cards || [])
    .filter((c) => c.type === 'went_well')
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  const wentBadCards = (roomState.cards || [])
    .filter((c) => c.type === 'went_bad')
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  const participantsList = Object.values(roomState.participants || {});
  const formattedDate = new Date(roomState.createdAt || Date.now()).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 print-container">
      {/* Action Bar (Hidden in Print) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Sesi Retrospektif Selesai!
            </h2>
            <p className="text-xs text-slate-400">
              Ruangan telah ditutup. Rangkuman di bawah siap dicetak atau disimpan sebagai PDF.
            </p>
          </div>
        </div>

        {/* FR 5.3 Export to PDF Button */}
        <button
          onClick={handlePrint}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition active:scale-95"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak / Simpan ke PDF</span>
        </button>
      </div>

      {/* Main Document Container (Specially formatted for print & web) */}
      <div className="bg-slate-900/90 print:bg-white border border-slate-800 print:border-none rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 text-slate-100 print:text-slate-900">
        {/* Document Header */}
        <div className="border-b border-slate-800 print:border-slate-300 pb-6 print-header">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 print:text-indigo-700 uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                Laporan Hasil Retrospektif Tim
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white print:text-slate-900">
                {roomState.name}
              </h1>
            </div>

            <div className="space-y-1 text-xs text-slate-400 print:text-slate-600">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>{participantsList.length} Peserta Terdaftar</span>
              </div>
            </div>
          </div>

          {/* Participant Badges */}
          <div className="mt-4 pt-4 border-t border-slate-800/60 print:border-slate-200 flex flex-wrap gap-1.5 items-center">
            <span className="text-xs text-slate-400 print:text-slate-600 font-semibold mr-1">
              Tim:
            </span>
            {participantsList.map((p) => (
              <span
                key={p.id}
                className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 print:bg-slate-100 text-slate-300 print:text-slate-800 border border-slate-700 print:border-slate-300 font-medium"
              >
                {p.name} {p.isHost ? '(Host)' : ''}
              </span>
            ))}
          </div>
        </div>

        {/* Section 1: Action Items (FR 5.2) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-400 print:text-indigo-600" />
            <h2 className="text-lg font-bold text-white print:text-slate-900">
              Action Items (Rencana Tindak Lanjut)
            </h2>
          </div>

          {actionItems.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-slate-800 print:border-slate-300 text-xs text-slate-500">
              Tidak ada action items yang dirumuskan.
            </div>
          ) : (
            <div className="space-y-2.5">
              {actionItems.map((ai, idx) => (
                <div
                  key={ai.id}
                  className="print-card flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950/60 print:bg-white border border-slate-800 print:border-slate-300"
                >
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 print:bg-indigo-100 print:text-indigo-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-100 print:text-slate-900">
                      {ai.text}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs">
                      {ai.assignee && (
                        <span className="inline-flex items-center gap-1 font-medium text-indigo-300 print:text-indigo-700">
                          <User className="w-3 h-3" /> PIC: <strong>{ai.assignee}</strong>
                        </span>
                      )}
                      {ai.relatedCardContent && (
                        <span className="text-slate-400 print:text-slate-600">
                          Solusi Masalah: "{ai.relatedCardContent}"
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2 Columns: What Went Well & What Went Bad (FR 5.2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800 print:border-slate-200">
          {/* What Went Well */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Smile className="w-4 h-4 text-emerald-400 print:text-emerald-600" />
              <h3 className="font-bold text-base text-white print:text-slate-900">
                What Went Well ({wentWellCards.length})
              </h3>
            </div>

            {wentWellCards.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-800 print:border-slate-300 text-xs text-slate-500">
                Tidak ada kartu "Went Well".
              </div>
            ) : (
              <div className="space-y-2.5">
                {wentWellCards.map((card, i) => (
                  <div
                    key={card.id}
                    className="print-card p-3 rounded-xl bg-emerald-950/20 print:bg-emerald-50/50 border border-emerald-500/20 print:border-slate-300"
                  >
                    <p className="text-xs font-medium text-slate-200 print:text-slate-800 mb-1.5">
                      {card.content}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 print:text-slate-600 font-mono">
                      <span>Anonim</span>
                      <span className="font-bold text-emerald-400 print:text-emerald-700">
                        👍 {card.upvotes || 0} | 👎 {card.downvotes || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* What Went Bad */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Frown className="w-4 h-4 text-rose-400 print:text-rose-600" />
              <h3 className="font-bold text-base text-white print:text-slate-900">
                What Went Bad ({wentBadCards.length})
              </h3>
            </div>

            {wentBadCards.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-800 print:border-slate-300 text-xs text-slate-500">
                Tidak ada kartu "Went Bad".
              </div>
            ) : (
              <div className="space-y-2.5">
                {wentBadCards.map((card, i) => (
                  <div
                    key={card.id}
                    className="print-card p-3 rounded-xl bg-rose-950/20 print:bg-rose-50/50 border border-rose-500/20 print:border-slate-300"
                  >
                    <p className="text-xs font-medium text-slate-200 print:text-slate-800 mb-1.5">
                      {card.content}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 print:text-slate-600 font-mono">
                      <span>Anonim</span>
                      <span className="font-bold text-rose-400 print:text-rose-700">
                        👍 {card.upvotes || 0} | 👎 {card.downvotes || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer info for print */}
        <div className="pt-6 border-t border-slate-800 print:border-slate-200 text-center text-[11px] text-slate-500">
          Dibuat secara otomatis dengan <strong>RetroTools</strong> — Platform Retrospektif Real-time
        </div>
      </div>
    </div>
  );
}
