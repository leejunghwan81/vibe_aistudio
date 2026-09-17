import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Bell, Volume2, Timer as TimerIcon } from 'lucide-react';
import { sound } from '../../utils/sound';
import { fireConfetti } from '../../utils/confetti';

interface ClassTimerProps {
  soundEnabled: boolean;
}

export const ClassTimer: React.FC<ClassTimerProps> = ({ soundEnabled }) => {
  const [mode, setMode] = useState<'countdown' | 'stopwatch'>('countdown');

  // Countdown seconds
  const [totalSeconds, setTotalSeconds] = useState<number>(300); // default 5 mins
  const [remainingSeconds, setRemainingSeconds] = useState<number>(300);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Stopwatch state
  const [stopwatchMs, setStopwatchMs] = useState<number>(0);

  // Interval ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Countdown tick
  useEffect(() => {
    if (mode === 'countdown' && isRunning) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            sound.playTimerAlarm();
            fireConfetti();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (mode === 'stopwatch' && isRunning) {
      const startTime = Date.now() - stopwatchMs;
      timerRef.current = setInterval(() => {
        setStopwatchMs(Date.now() - startTime);
      }, 50);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode, isRunning]);

  const toggleRun = () => {
    if (mode === 'countdown' && remainingSeconds === 0) {
      setRemainingSeconds(totalSeconds);
    }
    setIsRunning(!isRunning);
    sound.playTick();
  };

  const handleReset = () => {
    setIsRunning(false);
    if (mode === 'countdown') {
      setRemainingSeconds(totalSeconds);
    } else {
      setStopwatchMs(0);
    }
  };

  const setPresetSeconds = (sec: number) => {
    setIsRunning(false);
    setTotalSeconds(sec);
    setRemainingSeconds(sec);
    sound.playTick();
  };

  const addSeconds = (sec: number) => {
    setRemainingSeconds((prev) => {
      const next = prev + sec;
      if (next > totalSeconds) setTotalSeconds(next);
      return next;
    });
    sound.playTick();
  };

  // Format MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Format stopwatch MM:SS.SS
  const formatStopwatch = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    const centis = Math.floor((ms % 1000) / 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${centis.toString().padStart(2, '0')}`;
  };

  // Progress percentage
  const progressPercent = totalSeconds > 0 ? (remainingSeconds / totalSeconds) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => {
              setIsRunning(false);
              setMode('countdown');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              mode === 'countdown'
                ? 'bg-white text-indigo-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            타이머 (카운트다운)
          </button>
          <button
            onClick={() => {
              setIsRunning(false);
              setMode('stopwatch');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              mode === 'stopwatch'
                ? 'bg-white text-indigo-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            스톱워치
          </button>
        </div>

        {mode === 'countdown' && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">시간 추가:</span>
            <button
              onClick={() => addSeconds(30)}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700"
            >
              +30초
            </button>
            <button
              onClick={() => addSeconds(60)}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700"
            >
              +1분
            </button>
            <button
              onClick={() => addSeconds(300)}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700"
            >
              +5분
            </button>
          </div>
        )}
      </div>

      {/* Main Big Stage */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-14 shadow-sm flex flex-col items-center justify-center text-center">
        {mode === 'countdown' && (
          /* Progress Bar */
          <div className="w-full max-w-xl bg-slate-100 h-3 rounded-full mb-8 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                remainingSeconds <= 10
                  ? 'bg-rose-500 animate-pulse'
                  : remainingSeconds <= 30
                  ? 'bg-amber-500'
                  : 'bg-indigo-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Digital Clock Display */}
        <div
          className={`font-mono font-black tracking-tight select-none ${
            mode === 'countdown'
              ? remainingSeconds <= 10 && isRunning
                ? 'text-rose-600 animate-pulse text-7xl sm:text-9xl'
                : 'text-slate-900 text-7xl sm:text-9xl'
              : 'text-slate-900 text-6xl sm:text-8xl'
          }`}
        >
          {mode === 'countdown' ? formatTime(remainingSeconds) : formatStopwatch(stopwatchMs)}
        </div>

        {/* Status Label */}
        <p className="text-sm font-semibold text-slate-400 mt-4">
          {isRunning ? (
            <span className="flex items-center gap-1.5 text-indigo-600">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping"></span>
              시간이 측정되고 있습니다
            </span>
          ) : remainingSeconds === 0 && mode === 'countdown' ? (
            <span className="text-rose-600 font-bold flex items-center gap-1">
              <Bell className="w-4 h-4 animate-bounce" />
              시간이 종료되었습니다!
            </span>
          ) : (
            '준비 완료'
          )}
        </p>

        {/* Main Controls */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={handleReset}
            className="p-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="초기화"
          >
            <RotateCcw className="w-6 h-6" />
          </button>

          <button
            onClick={toggleRun}
            className={`flex items-center gap-3 px-10 py-4 rounded-2xl text-xl font-bold text-white shadow-lg transition-all active:scale-95 ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-6 h-6" />
                <span>일시정지</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6 fill-white" />
                <span>{remainingSeconds === 0 && mode === 'countdown' ? '다시 시작' : '시작'}</span>
              </>
            )}
          </button>
        </div>

        {/* Quick presets for classroom activities */}
        {mode === 'countdown' && (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            <span className="text-xs text-slate-400 font-medium mr-1">빠른 설정:</span>
            {[
              { label: '1분', sec: 60 },
              { label: '2분', sec: 120 },
              { label: '3분', sec: 180 },
              { label: '5분', sec: 300 },
              { label: '10분', sec: 600 },
              { label: '15분', sec: 900 },
              { label: '20분', sec: 1200 },
            ].map((p) => (
              <button
                key={p.sec}
                onClick={() => setPresetSeconds(p.sec)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                  totalSeconds === p.sec && !isRunning
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
