import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  Eye, 
  Printer, 
  Lock, 
  Unlock, 
  Ban, 
  Shuffle, 
  Sparkles, 
  CheckCircle2, 
  Compass, 
  Columns3, 
  Layout, 
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import { ClassPreset, SeatItem, SeatPerspective, SeatLayoutMode, Student } from '../../types';
import { sound } from '../../utils/sound';
import { fireBigConfetti } from '../../utils/confetti';

interface SeatPickerProps {
  currentClass: ClassPreset;
  soundEnabled: boolean;
}

export const SeatPicker: React.FC<SeatPickerProps> = ({ currentClass }) => {
  // Grid size configuration
  const [rows, setRows] = useState<number>(5);
  const [cols, setCols] = useState<number>(6);
  const [perspective, setPerspective] = useState<SeatPerspective>('teacher'); // 'teacher' | 'student'
  const [layoutMode, setLayoutMode] = useState<SeatLayoutMode>('pair'); // 'single' | 'pair'

  // Edit tools: 'select' (normal), 'pin' (lock student to seat), 'disable' (empty seat)
  const [editTool, setEditTool] = useState<'normal' | 'pin' | 'disable'>('normal');
  const [selectedStudentForPin, setSelectedStudentForPin] = useState<string>('');

  // Seat state grid
  const [seats, setSeats] = useState<SeatItem[]>([]);
  const [isRevealing, setIsRevealing] = useState<boolean>(false);
  const [revealProgress, setRevealProgress] = useState<number>(0);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  // Initialize or adjust seat grid
  useEffect(() => {
    // Retain existing pinned or disabled status if size changes
    setSeats((prevSeats) => {
      const newSeats: SeatItem[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const existing = prevSeats.find((s) => s.row === r && s.col === c);
          newSeats.push({
            row: r,
            col: c,
            studentId: existing ? existing.studentId : null,
            fixedStudentId: existing ? existing.fixedStudentId : null,
            disabled: existing ? existing.disabled : false,
            revealed: existing ? existing.revealed : false,
          });
        }
      }
      return newSeats;
    });
  }, [rows, cols]);

  // Adjust default grid size when student count drastically differs
  useEffect(() => {
    const studentCount = currentClass.students.length;
    if (studentCount > 0) {
      // Suggest reasonable rows and cols (e.g. 24 students -> 4 rows x 6 cols or 5x5)
      const calculatedCols = Math.min(8, Math.max(4, Math.ceil(Math.sqrt(studentCount * 1.2))));
      const calculatedRows = Math.ceil(studentCount / calculatedCols);
      if (calculatedRows * calculatedCols < studentCount) {
        setRows(calculatedRows + 1);
      } else {
        setRows(calculatedRows);
      }
      setCols(calculatedCols);
    }
  }, [currentClass.id]);

  // Active seats count
  const activeSeatsCount = seats.filter((s) => !s.disabled).length;
  const pinnedCount = seats.filter((s) => s.fixedStudentId && !s.disabled).length;

  // Perform Random Lottery
  const handleRandomize = (animated: boolean = true) => {
    if (isRevealing) return;

    const availableSeats = seats.filter((s) => !s.disabled);
    if (availableSeats.length < currentClass.students.length) {
      alert(`좌석 수가 부족합니다!\n현재 사용 가능한 좌석: ${availableSeats.length}개\n배치할 학생 수: ${currentClass.students.length}명\n\n행/열을 늘리거나 빈자리 설정을 해제해주세요.`);
      return;
    }

    // Identify pinned students
    const pinnedStudentIds = new Set(
      seats.filter((s) => s.fixedStudentId && !s.disabled).map((s) => s.fixedStudentId!)
    );

    // Remaining students to shuffle
    const unpinnedStudents = currentClass.students
      .filter((s) => !pinnedStudentIds.has(s.id))
      .map((s) => s.id);

    // Fisher-Yates shuffle
    for (let i = unpinnedStudents.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [unpinnedStudents[i], unpinnedStudents[j]] = [unpinnedStudents[j], unpinnedStudents[i]];
    }

    let unpinnedIdx = 0;
    const nextSeats = seats.map((seat) => {
      if (seat.disabled) {
        return { ...seat, studentId: null, revealed: false };
      }
      if (seat.fixedStudentId) {
        return { ...seat, studentId: seat.fixedStudentId, revealed: !animated };
      }
      const assignedId = unpinnedStudents[unpinnedIdx] || null;
      unpinnedIdx++;
      return { ...seat, studentId: assignedId, revealed: !animated };
    });

    if (!animated) {
      setSeats(nextSeats);
      sound.playFanfare();
      fireBigConfetti();
      return;
    }

    // Step-by-step reveal animation (thrilling presentation)
    setIsRevealing(true);
    setSeats(nextSeats.map((s) => ({ ...s, revealed: false })));
    setRevealProgress(0);

    const revealOrder = nextSeats
      .filter((s) => !s.disabled && s.studentId)
      .map((s) => ({ row: s.row, col: s.col }));

    // Shuffle reveal order for dramatic suspense
    for (let i = revealOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [revealOrder[i], revealOrder[j]] = [revealOrder[j], revealOrder[i]];
    }

    let currentStep = 0;
    const intervalTime = Math.max(60, Math.min(220, Math.floor(4000 / revealOrder.length)));

    const timer = setInterval(() => {
      if (currentStep >= revealOrder.length) {
        clearInterval(timer);
        setIsRevealing(false);
        sound.playFanfare();
        fireBigConfetti();
        return;
      }

      const target = revealOrder[currentStep];
      setSeats((prev) =>
        prev.map((s) =>
          s.row === target.row && s.col === target.col ? { ...s, revealed: true } : s
        )
      );

      sound.playPop();
      currentStep++;
      setRevealProgress(Math.round((currentStep / revealOrder.length) * 100));
    }, intervalTime);
  };

  // Reveal all hidden seats immediately
  const handleRevealAll = () => {
    setSeats((prev) => prev.map((s) => ({ ...s, revealed: true })));
    sound.playFanfare();
    fireBigConfetti();
  };

  // Reset seats
  const handleReset = () => {
    if (confirm('모든 자리 배치를 초기화하시겠습니까? (고정석 및 빈자리 설정은 유지됩니다)')) {
      setSeats((prev) => prev.map((s) => ({ ...s, studentId: null, revealed: false })));
    }
  };

  // Toggle seat on click based on edit tool
  const handleSeatClick = (r: number, c: number) => {
    if (isRevealing) return;

    const targetSeat = seats.find((s) => s.row === r && s.col === c);
    if (!targetSeat) return;

    if (editTool === 'disable') {
      // Toggle disabled status
      setSeats((prev) =>
        prev.map((s) =>
          s.row === r && s.col === c
            ? { ...s, disabled: !s.disabled, studentId: null, fixedStudentId: null, revealed: false }
            : s
        )
      );
      sound.playTick();
    } else if (editTool === 'pin') {
      // Pin/unpin student to this seat
      if (targetSeat.disabled) return;

      if (targetSeat.fixedStudentId) {
        // Unpin
        setSeats((prev) =>
          prev.map((s) =>
            s.row === r && s.col === c ? { ...s, fixedStudentId: null } : s
          )
        );
      } else if (selectedStudentForPin) {
        // Pin selected student (remove from other seats first)
        setSeats((prev) =>
          prev.map((s) => {
            if (s.fixedStudentId === selectedStudentForPin) {
              return { ...s, fixedStudentId: null };
            }
            if (s.row === r && s.col === c) {
              return { ...s, fixedStudentId: selectedStudentForPin, studentId: selectedStudentForPin };
            }
            return s;
          })
        );
      }
      sound.playTick();
    } else {
      // Normal click: if unrevealed, reveal this individual seat! (great for student interactive picking)
      if (targetSeat.studentId && !targetSeat.revealed) {
        setSeats((prev) =>
          prev.map((s) => (s.row === r && s.col === c ? { ...s, revealed: true } : s))
        );
        sound.playPop();
      }
    }
  };

  // Copy seat table as text to clipboard
  const handleCopyText = () => {
    let result = `[${currentClass.name} 자리 배치표]\n(교탁 방향: ${perspective === 'teacher' ? '교사 시점' : '학생 시점'})\n\n`;

    for (let r = 0; r < rows; r++) {
      const rowCols = [];
      for (let c = 0; c < cols; c++) {
        // adjust col based on perspective
        const actualCol = perspective === 'student' ? cols - 1 - c : c;
        const seat = seats.find((s) => s.row === r && s.col === actualCol);
        if (!seat || seat.disabled) {
          rowCols.push('[ 빈 자리 ]');
        } else if (!seat.studentId) {
          rowCols.push('[ 미배치 ]');
        } else {
          const student = currentClass.students.find((s) => s.id === seat.studentId);
          rowCols.push(student ? `[${student.number}.${student.name}]` : '[ 미배치 ]');
        }
      }
      result += rowCols.join(' ') + '\n';
    }

    navigator.clipboard.writeText(result).then(() => {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    });
  };

  const getStudentInfo = (id: string | null): Student | undefined => {
    if (!id) return undefined;
    return currentClass.students.find((s) => s.id === id);
  };

  return (
    <div className="space-y-6">
      {/* Top Configuration Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs print:hidden space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Grid Dimensions */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <span className="font-semibold text-slate-700">배치 크기:</span>
              <div className="flex items-center gap-1">
                <label className="text-xs text-slate-500">세로(행)</label>
                <input
                  type="number"
                  min={2}
                  max={8}
                  value={rows}
                  onChange={(e) => setRows(Math.max(2, Math.min(8, parseInt(e.target.value) || 2)))}
                  className="w-12 text-center py-0.5 border border-slate-300 rounded font-bold bg-white"
                />
              </div>
              <span className="text-slate-400">×</span>
              <div className="flex items-center gap-1">
                <label className="text-xs text-slate-500">가로(열)</label>
                <input
                  type="number"
                  min={2}
                  max={10}
                  value={cols}
                  onChange={(e) => setCols(Math.max(2, Math.min(10, parseInt(e.target.value) || 2)))}
                  className="w-12 text-center py-0.5 border border-slate-300 rounded font-bold bg-white"
                />
              </div>
              <span className="text-xs font-bold text-indigo-600 ml-1">
                (총 {rows * cols}석 / 사용가능 {activeSeatsCount}석)
              </span>
            </div>

            {/* Layout mode: Single vs Pair */}
            <div className="flex items-center bg-slate-50 border border-slate-200 p-1 rounded-xl">
              <button
                onClick={() => setLayoutMode('pair')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  layoutMode === 'pair'
                    ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="2인 1조 짝꿍 배열"
              >
                <Columns3 className="w-3.5 h-3.5" />
                짝꿍 배치
              </button>
              <button
                onClick={() => setLayoutMode('single')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  layoutMode === 'single'
                    ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="1인 1석 단독 배열"
              >
                <Layout className="w-3.5 h-3.5" />
                단독 배치
              </button>
            </div>

            {/* Perspective View Switcher */}
            <div className="flex items-center bg-slate-50 border border-slate-200 p-1 rounded-xl">
              <button
                onClick={() => setPerspective('teacher')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  perspective === 'teacher'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="교탁에서 학생들을 바라보는 교사용 시점"
              >
                <Compass className="w-3.5 h-3.5" />
                교사 시점
              </button>
              <button
                onClick={() => setPerspective('student')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  perspective === 'student'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="학생들이 칠판을 바라보는 시점 (좌우 반전)"
              >
                <Eye className="w-3.5 h-3.5" />
                학생 시점 (좌우 반전)
              </button>
            </div>
          </div>

          {/* Quick Info & Print/Copy */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
              title="텍스트로 좌석 배치표 복사"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedText ? '복사 완료' : '텍스트 복사'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
              title="A4 좌석표 깔끔하게 인쇄"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>인쇄</span>
            </button>
          </div>
        </div>

        {/* Action Controls & Special Seat Setup */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {/* Edit Tools: Normal / Pin / Disable */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 mr-1">자리 설정 모드:</span>
            
            <button
              onClick={() => setEditTool('normal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                editTool === 'normal'
                  ? 'bg-slate-800 text-white border-slate-800 shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              기본 선택
            </button>

            <button
              onClick={() => setEditTool('disable')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                editTool === 'disable'
                  ? 'bg-rose-500 text-white border-rose-500 shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="클릭하여 빈자리/통로 지정"
            >
              <Ban className="w-3.5 h-3.5" />
              빈자리 지정 ({seats.filter((s) => s.disabled).length}개)
            </button>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setEditTool('pin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  editTool === 'pin'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
                title="시력/건강 배려 학생 고정석 지정"
              >
                <Lock className="w-3.5 h-3.5" />
                고정석 지정 ({pinnedCount}명)
              </button>

              {editTool === 'pin' && (
                <select
                  value={selectedStudentForPin}
                  onChange={(e) => setSelectedStudentForPin(e.target.value)}
                  className="text-xs border border-amber-300 bg-amber-50 text-amber-900 rounded-lg py-1 px-2 font-semibold outline-none"
                >
                  <option value="">고정할 학생 선택...</option>
                  {currentClass.students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.number}번 {s.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Lottery Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              disabled={isRevealing}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
              title="배치 결과 초기화"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              초기화
            </button>

            <button
              onClick={handleRevealAll}
              disabled={isRevealing || seats.every((s) => s.revealed)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors disabled:opacity-50"
              title="가려진 모든 자리 한번에 보기"
            >
              <Eye className="w-3.5 h-3.5" />
              전체 공개
            </button>

            <button
              id="btn-start-seat-lottery"
              onClick={() => handleRandomize(true)}
              disabled={isRevealing}
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-md shadow-indigo-200 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isRevealing ? `배치 진행 중... (${revealProgress}%)` : '자리 뽑기 시작!'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Classroom Canvas / Blackboard & Seat Display */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col items-center relative overflow-hidden">
        {/* Printable Header (Visible only when printed) */}
        <div className="hidden print:block w-full mb-6 pb-4 border-b-2 border-slate-800 text-center">
          <h2 className="text-2xl font-black text-slate-900">{currentClass.name} 자리 배치표</h2>
          <p className="text-xs text-slate-500 mt-1">
            출력일시: {new Date().toLocaleDateString('ko-KR')} | 기준: {perspective === 'teacher' ? '교사 시점' : '학생 시점 (좌우 반전)'}
          </p>
        </div>

        {/* Direction Indicator Banner (교탁 / 칠판 위치) */}
        <div className="w-full max-w-2xl mb-8 flex flex-col items-center">
          <div className="w-full h-11 bg-slate-800 rounded-2xl shadow-inner flex items-center justify-center relative border border-slate-700 text-white font-bold tracking-wider text-sm">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              칠 판 / 교 탁 (앞 쪽)
            </span>
            <div className="absolute left-4 text-xs font-normal text-slate-400">
              ◀ {perspective === 'teacher' ? '창가' : '복도'}
            </div>
            <div className="absolute right-4 text-xs font-normal text-slate-400">
              {perspective === 'teacher' ? '복도' : '창가'} ▶
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5 font-medium print:hidden">
            {perspective === 'teacher'
              ? '💡 교사용 시점 (선생님이 교탁에서 교실 뒤쪽을 바라봄)'
              : '💡 학생용 시점 (학생들이 칠판을 바라보는 방향으로 좌우 반전됨)'}
          </p>
        </div>

        {/* Seat Grid */}
        <div className="w-full overflow-x-auto flex justify-center py-2">
          <div className="inline-flex flex-col gap-3.5 sm:gap-4.5">
            {Array.from({ length: rows }).map((_, r) => (
              <div key={r} className="flex items-center justify-center gap-2 sm:gap-3">
                {/* Row label */}
                <div className="w-6 text-right text-xs font-bold text-slate-300 select-none mr-1">
                  {r + 1}열
                </div>

                {Array.from({ length: cols }).map((_, c) => {
                  // Adjust col index for student perspective (flip horizontally)
                  const actualCol = perspective === 'student' ? cols - 1 - c : c;
                  const seat = seats.find((s) => s.row === r && s.col === actualCol);
                  if (!seat) return null;

                  const student = getStudentInfo(seat.studentId);
                  const isPinned = !!seat.fixedStudentId;
                  const isPairDivider = layoutMode === 'pair' && c % 2 === 1 && c < cols - 1;

                  return (
                    <React.Fragment key={`${r}-${actualCol}`}>
                      <div
                        onClick={() => handleSeatClick(r, actualCol)}
                        className={`relative w-20 sm:w-26 md:w-30 h-16 sm:h-20 rounded-xl sm:rounded-2xl border-2 transition-all flex flex-col items-center justify-center p-1.5 cursor-pointer select-none group ${
                          seat.disabled
                            ? 'bg-slate-100/70 border-dashed border-slate-300 text-slate-300 shadow-none'
                            : seat.revealed && student
                            ? 'bg-indigo-50/70 border-indigo-300 text-indigo-950 shadow-xs hover:border-indigo-400 hover:scale-102'
                            : seat.studentId
                            ? 'bg-slate-50 border-slate-300 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/30'
                            : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                        }`}
                        title={
                          seat.disabled
                            ? '빈자리/통로'
                            : isPinned
                            ? `고정석: ${student?.name || '미배치'}`
                            : student
                            ? `${student.number}번 ${student.name}`
                            : '미배정 좌석'
                        }
                      >
                        {/* Pin Badge */}
                        {isPinned && !seat.disabled && (
                          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-xs">
                            <Lock className="w-2.5 h-2.5" />
                          </div>
                        )}

                        {/* Content */}
                        {seat.disabled ? (
                          <span className="text-[11px] font-medium text-slate-400">빈자리</span>
                        ) : seat.revealed && student ? (
                          <>
                            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-100/80 px-1.5 py-0.2 rounded-full mb-0.5">
                              {student.number}번
                            </span>
                            <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 truncate max-w-full">
                              {student.name}
                            </span>
                          </>
                        ) : seat.studentId ? (
                          /* Hidden/Masked Seat - Click to reveal or wait for lottery */
                          <div className="flex flex-col items-center">
                            <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs mb-1 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                              ?
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">클릭시 공개</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300 font-medium">좌석</span>
                        )}
                      </div>

                      {/* Corridor / Pair gap */}
                      {isPairDivider && (
                        <div className="w-3 sm:w-5 border-r-2 border-dashed border-slate-200 h-10 my-auto" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Back of Classroom Indicator */}
        <div className="mt-8 text-xs font-semibold text-slate-400 flex items-center gap-1.5">
          <span>▼ 교실 뒤쪽 (사물함 / 게시판) ▼</span>
        </div>
      </div>

      {/* Helpful Classroom Tips */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs text-slate-600 flex items-start gap-3 print:hidden">
        <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-slate-800">선생님을 위한 자리뽑기 꿀팁</p>
          <ul className="list-disc list-inside space-y-0.5 text-slate-500">
            <li>
              <strong>학생 시점 전환:</strong> 교실 빔프로젝터나 TV로 띄울 때는 <strong>'학생 시점'</strong>을 누르면 학생들이 보는 방향과 책상 위치가 일치합니다.
            </li>
            <li>
              <strong>참여형 공개:</strong> 자리뽑기 후 카드가 가려져 있을 때, 학생들이 한 명씩 앞으로 나와 자기 자리를 직접 클릭하여 여는 이벤트로 활용할 수 있습니다.
            </li>
            <li>
              <strong>고정석 기능:</strong> 안경을 안 가져왔거나 특별 지도가 필요한 학생은 <strong>'고정석 지정'</strong>을 켜서 원하는 자리에 핀을 꽂아둘 수 있습니다.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
