import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  Sparkles, 
  Users, 
  Check, 
  History, 
  Trash2, 
  Flame, 
  Sliders, 
  UserCheck 
} from 'lucide-react';
import { ClassPreset, Student } from '../../types';
import { sound } from '../../utils/sound';
import { fireBigConfetti } from '../../utils/confetti';

interface NumberPickerProps {
  currentClass: ClassPreset;
  soundEnabled: boolean;
}

export const NumberPicker: React.FC<NumberPickerProps> = ({ currentClass }) => {
  // Mode: 'roster' (from current class students) or 'range' (arbitrary 1 ~ N)
  const [mode, setMode] = useState<'roster' | 'range'>('roster');
  const [minNum, setMinNum] = useState<number>(1);
  const [maxNum, setMaxNum] = useState<number>(currentClass.students.length || 25);

  // How many to draw at once
  const [drawCount, setDrawCount] = useState<number>(1);
  // Prevent duplicate picks in subsequent rounds
  const [excludeAlreadyPicked, setExcludeAlreadyPicked] = useState<boolean>(true);

  // Pick state
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [currentDisplay, setCurrentDisplay] = useState<Student[]>([]);
  const [pickedHistory, setPickedHistory] = useState<{ id: string; student: Student; time: string }[]>([]);
  const [lastDrawn, setLastDrawn] = useState<Student[]>([]);

  // Update max number if class student count changes
  useEffect(() => {
    if (mode === 'roster') {
      setMaxNum(Math.max(1, currentClass.students.length));
    }
  }, [currentClass.students.length, mode]);

  // Already picked IDs
  const alreadyPickedIds = new Set(pickedHistory.map((item) => item.student.id));

  // Eligible pool of candidates
  const candidatePool: Student[] = React.useMemo(() => {
    if (mode === 'roster') {
      if (excludeAlreadyPicked) {
        return currentClass.students.filter((s) => !alreadyPickedIds.has(s.id));
      }
      return currentClass.students;
    } else {
      // Range mode
      const list: Student[] = [];
      for (let n = minNum; n <= maxNum; n++) {
        const id = `range-${n}`;
        if (!excludeAlreadyPicked || !alreadyPickedIds.has(id)) {
          list.push({
            id,
            number: n,
            name: `${n}번`,
          });
        }
      }
      return list;
    }
  }, [mode, minNum, maxNum, excludeAlreadyPicked, currentClass.students, alreadyPickedIds]);

  const handleStartDraw = () => {
    if (isRolling) return;

    if (candidatePool.length === 0) {
      alert('남은 후보가 없습니다! 이미 모든 번호/학생이 뽑혔습니다. 기록을 초기화하거나 중복 제외 옵션을 해제하세요.');
      return;
    }

    const actualCount = Math.min(drawCount, candidatePool.length);
    setIsRolling(true);

    let rollsLeft = 24; // number of tick iterations
    const intervalTime = 65;

    const timer = setInterval(() => {
      // Pick random temporary subset for animation
      const tempPicked: Student[] = [];
      const poolCopy = [...candidatePool];
      for (let i = 0; i < actualCount; i++) {
        const randIdx = Math.floor(Math.random() * poolCopy.length);
        tempPicked.push(poolCopy[randIdx]);
        poolCopy.splice(randIdx, 1);
      }
      setCurrentDisplay(tempPicked);
      sound.playTick();

      rollsLeft--;
      if (rollsLeft <= 0) {
        clearInterval(timer);

        // Final random pick
        const finalPicked: Student[] = [];
        const finalPool = [...candidatePool];
        for (let i = 0; i < actualCount; i++) {
          const randIdx = Math.floor(Math.random() * finalPool.length);
          finalPicked.push(finalPool[randIdx]);
          finalPool.splice(randIdx, 1);
        }

        setCurrentDisplay(finalPicked);
        setLastDrawn(finalPicked);
        setIsRolling(false);
        sound.playFanfare();
        fireBigConfetti();

        // Add to history
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        const newHistoryEntries = finalPicked.map((st) => ({
          id: `${Date.now()}-${st.id}`,
          student: st,
          time: timeStr,
        }));
        setPickedHistory((prev) => [...newHistoryEntries, ...prev]);
      }
    }, intervalTime);
  };

  const handleResetHistory = () => {
    if (confirm('뽑기 기록과 당첨 목록을 초기화하시겠습니까?')) {
      setPickedHistory([]);
      setCurrentDisplay([]);
      setLastDrawn([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => {
                setMode('roster');
                setCurrentDisplay([]);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'roster'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              학급 명단으로 뽑기 ({currentClass.name})
            </button>
            <button
              onClick={() => {
                setMode('range');
                setCurrentDisplay([]);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'range'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              숫자 번호 범위로 뽑기
            </button>
          </div>

          {/* Draw Count Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">한 번에 뽑을 인원:</span>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-0.5">
              {[1, 2, 3, 4, 5].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => setDrawCount(cnt)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    drawCount === cnt
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  {cnt}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-500">명</span>
          </div>
        </div>

        {/* Options Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
          {mode === 'range' && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <span className="font-semibold text-slate-700">번호 범위:</span>
              <input
                type="number"
                min={1}
                value={minNum}
                onChange={(e) => setMinNum(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-14 text-center py-0.5 border border-slate-300 rounded font-bold bg-white"
              />
              <span className="text-slate-400">~</span>
              <input
                type="number"
                min={minNum}
                value={maxNum}
                onChange={(e) => setMaxNum(Math.max(minNum, parseInt(e.target.value) || minNum))}
                className="w-14 text-center py-0.5 border border-slate-300 rounded font-bold bg-white"
              />
              <span className="text-slate-500 font-medium">번</span>
            </div>
          )}

          {/* Duplicate toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={excludeAlreadyPicked}
              onChange={(e) => setExcludeAlreadyPicked(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <span className="font-medium text-slate-700">
              이미 뽑힌 번호 제외 (중복 방지)
            </span>
          </label>

          {/* Remaining Count */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500">
              뽑기 가능 후보: <strong className="text-indigo-600 font-bold">{candidatePool.length}명</strong>
              {excludeAlreadyPicked && (
                <span className="text-slate-400 ml-1">
                  (총 {mode === 'roster' ? currentClass.students.length : maxNum - minNum + 1}명 중)
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Big Stage Drawing Display */}
      <div className="bg-gradient-to-b from-white to-indigo-50/40 border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm flex flex-col items-center justify-center min-h-[380px] relative overflow-hidden">
        {/* Glow ambient background effect */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />

        {/* Display Title */}
        <div className="flex items-center gap-2 mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
            <Flame className="w-3.5 h-3.5 text-indigo-600" />
            {isRolling ? '두근두근 추첨 진행 중...' : lastDrawn.length > 0 ? '추첨 완료!' : '발표자 추첨 준비'}
          </span>
        </div>

        {/* Render Result Cards */}
        {currentDisplay.length > 0 ? (
          <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-7 my-4 w-full max-w-4xl">
            {currentDisplay.map((st, idx) => (
              <div
                key={idx}
                className={`relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl border-2 transition-all duration-150 transform ${
                  isRolling
                    ? 'bg-white border-indigo-400 shadow-lg scale-98 text-slate-800 animate-pulse'
                    : 'bg-white border-indigo-600 shadow-xl scale-100 text-slate-900 ring-4 ring-indigo-100'
                } min-w-[160px] sm:min-w-[210px]`}
              >
                {/* Number Badge */}
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md shadow-indigo-200 mb-3">
                  {st.number}
                </div>

                {/* Name */}
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight text-center">
                  {st.name}
                </div>

                {!isRolling && (
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full mt-2.5">
                    당첨!
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Empty / Standby Graphic */
          <div className="text-center py-10 space-y-3">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
              <Sparkles className="w-10 h-10 text-amber-500 animate-bounce" />
            </div>
            <p className="text-base font-bold text-slate-700">
              아래 버튼을 눌러 번호/이름을 뽑아보세요!
            </p>
            <p className="text-xs text-slate-400">
              질문할 학생, 발표자, 오늘의 1일 당번 등을 공정하고 신나게 추첨합니다.
            </p>
          </div>
        )}

        {/* Big Start Draw Button */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            id="btn-start-number-lottery"
            onClick={handleStartDraw}
            disabled={isRolling}
            className={`flex items-center gap-3 px-8 sm:px-12 py-3.5 sm:py-4 rounded-2xl text-lg sm:text-xl font-black text-white shadow-lg transition-all active:scale-95 ${
              isRolling
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-300 shadow-indigo-200'
            }`}
          >
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>{isRolling ? '추첨 중...' : `${drawCount}명 뽑기!`}</span>
          </button>

          <span className="text-[11px] text-slate-400">
            단축키: 스페이스바(Space) 또는 엔터(Enter) 키로도 뽑을 수 있습니다
          </span>
        </div>
      </div>

      {/* History & Statistics */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-800">
              오늘의 뽑기 기록 (총 {pickedHistory.length}명)
            </h3>
          </div>

          {pickedHistory.length > 0 && (
            <button
              onClick={handleResetHistory}
              className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-700 px-2.5 py-1 rounded-md hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              기록 지우기
            </button>
          )}
        </div>

        {pickedHistory.length > 0 ? (
          <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto pr-1">
            {pickedHistory.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 shadow-2xs hover:bg-indigo-50/60 hover:border-indigo-200 transition-colors"
              >
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {pickedHistory.length - idx}
                </span>
                <span className="text-indigo-600 font-bold">{item.student.number}번</span>
                <span>{item.student.name}</span>
                <span className="text-[10px] text-slate-400 font-normal ml-0.5">{item.time}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-400">
            아직 뽑힌 학생이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};
