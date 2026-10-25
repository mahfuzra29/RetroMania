import React, { useState } from 'react';
import {
  Send,
  Sparkles,
  Smile,
  Frown,
  Shield,
  Lock,
  Trash2,
  Tv,
  PenLine,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import Timer from '../components/Timer';
import PresentationView from './PresentationView';
import RetroCard from '../components/RetroCard';
import { sound } from '../utils/sound';

export default function SubmissionView({
  roomState,
  isHost,
  participant,
  onAddCard,
  onDeleteCard,
  onAddTime,
  onEndEarly,
}) {
  // If host, default to presentation tab or private tab; participants default to private tab
  const [activeTab, setActiveTab] = useState(isHost ? 'presentation' : 'write');
  const [content, setContent] = useState('');

  const isWentWell = roomState.stage === 'went_well_submission';
  const cardType = isWentWell ? 'went_well' : 'went_bad';
  const stageName = isWentWell ? 'What Went Well' : 'What Went Bad';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    sound.playPop();
    onAddCard({
      type: cardType,
      content: content.trim(),
    });
    setContent('');
  };

  const handleOpenPopout = () => {
    sound.playPop();
    const url = `${window.location.origin}/?room=${roomState.id}&view=presentation`;
    window.open(url, '_blank', 'width=1200,height=800,menubar=no,toolbar=no,location=no');
  };

  // Filter cards for the current stage
  const currentStageCards = (roomState.cards || []).filter((c) => c.type === cardType);
  const myCards = currentStageCards.filter((c) => c.isMine);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Top Navigation Tabs to Separate Share Screen Board and Private Writing */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-2 rounded-2xl shadow-md">
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800/80">
          {/* Tab 1: Presentation Board (Aman Share Screen) */}
          <button
            onClick={() => {
              sound.playPop();
              setActiveTab('presentation');
            }}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'presentation'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tv className="w-4 h-4 text-emerald-400" />
            <span>Layar Presentasi (Share Screen)</span>
          </button>

          {/* Tab 2: Private Submission Workspace */}
          <button
            onClick={() => {
              sound.playPop();
              setActiveTab('write');
            }}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'write'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PenLine className="w-4 h-4 text-amber-400" />
            <span>Tulis Kartu Saya (Area Privat)</span>
            {myCards.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                {myCards.length}
              </span>
            )}
          </button>
        </div>

        {/* Pop-out Presentation Window button */}
        <button
          onClick={handleOpenPopout}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
          title="Buka Layar Presentasi di Jendela Baru agar Anda bisa share screen jendela tersebut sambil mengetik kartu di sini"
        >
          <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
          <span>Buka Jendela Share Screen Terpisah</span>
        </button>
      </div>

      {/* CONTENT FOR TAB 1: PRESENTATION / SHARE SCREEN BOARD */}
      {activeTab === 'presentation' && (
        <PresentationView
          roomState={roomState}
          isHost={isHost}
          onAddTime={onAddTime}
          onEndEarly={onEndEarly}
          onOpenPopout={handleOpenPopout}
        />
      )}

      {/* CONTENT FOR TAB 2: PRIVATE CARD SUBMISSION WORKSPACE */}
      {activeTab === 'write' && (
        <div className="space-y-6">
          {/* Private Workspace Alert Banner */}
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-3 text-amber-300">
            <ShieldAlert className="w-5 h-5 shrink-0 text-amber-400" />
            <div className="text-xs">
              <strong className="font-bold">Area Privat:</strong> Ketik masukan anonim Anda di sini. Jangan bagikan layar tab ini jika Anda sedang share screen ke peserta agar isi kartu Anda tidak terlihat.
            </div>
          </div>

          {/* Compact Timer for Writer */}
          <Timer
            stageEndsAt={roomState.stageEndsAt}
            totalMinutes={roomState.sessionDurationMinutes}
            isHost={isHost}
            onAddTime={onAddTime}
            onEndEarly={onEndEarly}
          />

          {/* Form: Write card FR 2.2 */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
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
                <h2 className="text-base font-bold text-white">
                  {isWentWell ? 'Tulis: What Went Well' : 'Tulis: What Went Bad'}
                </h2>
                <p className="text-xs text-slate-400">
                  {isWentWell
                    ? 'Apa hal baik, pencapaian, atau kolaborasi sukses selama sprint ini?'
                    : 'Kendala atau hal apa yang menghambat kelancaran sprint?'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <textarea
                  rows={4}
                  autoFocus
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={
                    isWentWell
                      ? 'cth. Fitur pembayaran berhasil rilis lebih awal dan minim bug...'
                      : 'cth. Keterlambatan respon API pihak ketiga menghambat proses testing...'
                  }
                  className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl text-sm text-white placeholder-slate-500 outline-none transition resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>100% Anonim. Nama Anda tidak akan pernah dikaitkan pada kartu ini.</span>
                </div>

                <button
                  type="submit"
                  disabled={!content.trim()}
                  className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition active:scale-95 disabled:opacity-40 disabled:pointer-events-none shadow-md ${
                    isWentWell
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                      : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                  }`}
                >
                  <span>Kirim Masukan</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>

          {/* List of ONLY My Private Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-200">
                Kartu Masukan Milik Anda ({myCards.length})
              </h3>
              <span className="text-xs text-slate-400">
                Hanya Anda yang dapat melihat teks kartu ini saat ini.
              </span>
            </div>

            {myCards.length === 0 ? (
              <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-3xl bg-slate-900/40">
                <p className="text-sm text-slate-400 mb-1">
                  Anda belum mengirimkan masukan untuk sesi {stageName}.
                </p>
                <p className="text-xs text-slate-500">
                  Tulis ide atau masukan Anda pada formulir di atas lalu klik Kirim Masukan.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myCards.map((card) => (
                  <RetroCard
                    key={card.id}
                    card={card}
                    isVotingStage={false}
                    onDelete={onDeleteCard}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
