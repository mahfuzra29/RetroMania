import React, { useEffect, useState, useRef } from 'react';
import { Clock, Plus, Square, AlertCircle } from 'lucide-react';
import { sound } from '../utils/sound';

export default function Timer({ stageEndsAt, totalMinutes = 3, isHost, onAddTime, onEndEarly }) {
  const [timeLeft, setTimeLeft] = useState(0);
  const warnedRef = useRef(false);

  useEffect(() => {
    if (!stageEndsAt) {
      setTimeLeft(0);
      return;
    }

    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((stageEndsAt - Date.now()) / 1000));
      setTimeLeft(remaining);

      // Warning chime at 10 seconds
      if (remaining === 10 && !warnedRef.current) {
        sound.playBell();
        warnedRef.current = true;
      }
      if (remaining === 0 && warnedRef.current) {
        sound.playChime();
        warnedRef.current = false;
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [stageEndsAt]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isLowTime = timeLeft <= 30 && timeLeft > 0;
  const isTimeUp = timeLeft === 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Timer Display */}
      <div className="flex items-center gap-3">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
            isLowTime
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
              : isTimeUp
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
          }`}
        >
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            {isTimeUp ? 'Waktu Habis!' : 'Sisa Waktu Sesi'}
          </span>
          <span
            className={`font-mono text-3xl font-extrabold tracking-tight ${
              isLowTime ? 'text-rose-400' : isTimeUp ? 'text-amber-400' : 'text-white'
            }`}
          >
            {formattedTime}
          </span>
        </div>
      </div>

      {/* Host Controls FR 2.4 */}
      {isHost && (
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => onAddTime(60)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition active:scale-95"
            title="Tambah 1 Menit"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>+1 Menit</span>
          </button>

          <button
            onClick={onEndEarly}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium text-xs transition active:scale-95"
            title="Akhiri Sesi Lebih Awal"
          >
            <Square className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
            <span>Akhiri Sesi</span>
          </button>
        </div>
      )}
    </div>
  );
}
