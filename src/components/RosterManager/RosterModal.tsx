import React, { useState } from 'react';
import { X, Plus, Trash2, Users, FileText, Check, AlertCircle } from 'lucide-react';
import { ClassPreset, Student } from '../../types';
import { parsePastedNames } from '../../utils/storage';

interface RosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassPreset[];
  activeClassId: string;
  onUpdateClasses: (newClasses: ClassPreset[], newActiveId?: string) => void;
}

export const RosterModal: React.FC<RosterModalProps> = ({
  isOpen,
  onClose,
  classes,
  activeClassId,
  onUpdateClasses,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(activeClassId);
  const [pasteMode, setPasteMode] = useState<boolean>(false);
  const [pastedText, setPastedText] = useState<string>('');
  const [quickCount, setQuickCount] = useState<number>(25);

  if (!isOpen) return null;

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  const handleAddClass = () => {
    const newClassNum = classes.length + 1;
    const newId = `class-${Date.now()}`;
    const newClass: ClassPreset = {
      id: newId,
      name: `${newClassNum}반 (25명)`,
      students: Array.from({ length: 25 }, (_, i) => ({
        id: `s-${newId}-${i + 1}`,
        number: i + 1,
        name: `${i + 1}번 학생`,
      })),
    };
    const updated = [...classes, newClass];
    onUpdateClasses(updated, newId);
    setSelectedClassId(newId);
  };

  const handleDeleteClass = (id: string) => {
    if (classes.length <= 1) {
      alert('최소 1개의 학급 명단이 유지되어야 합니다.');
      return;
    }
    if (confirm('이 학급을 삭제하시겠습니까?')) {
      const updated = classes.filter((c) => c.id !== id);
      const nextActiveId = updated[0].id;
      onUpdateClasses(updated, nextActiveId);
      setSelectedClassId(nextActiveId);
    }
  };

  const handleUpdateClassName = (name: string) => {
    const updated = classes.map((c) =>
      c.id === currentClass.id ? { ...c, name } : c
    );
    onUpdateClasses(updated);
  };

  const handleStudentNameChange = (studentId: string, newName: string) => {
    const updatedStudents = currentClass.students.map((s) =>
      s.id === studentId ? { ...s, name: newName } : s
    );
    const updated = classes.map((c) =>
      c.id === currentClass.id ? { ...c, students: updatedStudents } : c
    );
    onUpdateClasses(updated);
  };

  const handleStudentNumberChange = (studentId: string, newNum: number) => {
    const updatedStudents = currentClass.students.map((s) =>
      s.id === studentId ? { ...s, number: newNum } : s
    );
    const updated = classes.map((c) =>
      c.id === currentClass.id ? { ...c, students: updatedStudents } : c
    );
    onUpdateClasses(updated);
  };

  const handleAddStudent = () => {
    const nextNumber = currentClass.students.length > 0 
      ? Math.max(...currentClass.students.map(s => s.number)) + 1 
      : 1;
    const newStudent: Student = {
      id: `s-${Date.now()}-${nextNumber}`,
      number: nextNumber,
      name: `${nextNumber}번 학생`,
    };
    const updated = classes.map((c) =>
      c.id === currentClass.id
        ? { ...c, students: [...c.students, newStudent] }
        : c
    );
    onUpdateClasses(updated);
  };

  const handleDeleteStudent = (studentId: string) => {
    const updatedStudents = currentClass.students.filter((s) => s.id !== studentId);
    const updated = classes.map((c) =>
      c.id === currentClass.id ? { ...c, students: updatedStudents } : c
    );
    onUpdateClasses(updated);
  };

  const handleApplyQuickNumbers = () => {
    const students: Student[] = Array.from({ length: quickCount }, (_, i) => ({
      id: `s-${currentClass.id}-${i + 1}-${Date.now()}`,
      number: i + 1,
      name: `${i + 1}번 학생`,
    }));
    const updated = classes.map((c) =>
      c.id === currentClass.id ? { ...c, students } : c
    );
    onUpdateClasses(updated);
  };

  const handleApplyPastedNames = () => {
    const parsed = parsePastedNames(pastedText);
    if (parsed.length === 0) {
      alert('입력된 명단에서 유효한 이름을 찾지 못했습니다.');
      return;
    }
    const updated = classes.map((c) =>
      c.id === currentClass.id ? { ...c, students: parsed } : c
    );
    onUpdateClasses(updated);
    setPastedText('');
    setPasteMode(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div 
        id="roster-modal" 
        className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">학급 및 학생 명단 관리</h2>
              <p className="text-xs text-slate-500">
                자리뽑기 및 번호뽑기에 연동되는 우리 반 학생 명단을 등록하세요. (브라우저 자동저장)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Class Preset List Sidebar */}
          <div className="w-full md:w-64 border-r border-slate-200 bg-slate-50/40 p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">학급 목록</span>
              <button
                id="btn-add-class"
                onClick={handleAddClass}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded-md transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                새 학급
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {classes.map((cls) => {
                const isSelected = cls.id === currentClass.id;
                return (
                  <div
                    key={cls.id}
                    onClick={() => setSelectedClassId(cls.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/70'
                    }`}
                  >
                    <div className="truncate mr-2">
                      <span className="block truncate">{cls.name}</span>
                      <span className={`text-[11px] ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                        {cls.students.length}명
                      </span>
                    </div>
                    {classes.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClass(cls.id);
                        }}
                        className={`p-1 rounded hover:bg-rose-500/20 ${
                          isSelected ? 'text-white' : 'text-slate-400 hover:text-rose-600'
                        }`}
                        title="학급 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Student Editor Section */}
          <div className="flex-1 flex flex-col p-5 overflow-y-auto">
            {/* Class Name Edit and Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
              <div className="flex-1 w-full sm:w-auto">
                <label className="text-xs font-semibold text-slate-500 block mb-1">학급명</label>
                <input
                  type="text"
                  value={currentClass.name}
                  onChange={(e) => handleUpdateClassName(e.target.value)}
                  className="w-full text-base font-bold text-slate-900 border border-slate-300 rounded-lg px-3 py-1.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  placeholder="예: 3학년 2반"
                />
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => setPasteMode(!pasteMode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    pasteMode
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  {pasteMode ? '목록으로 돌아가기' : '엑셀/텍스트 일괄 붙여넣기'}
                </button>
              </div>
            </div>

            {pasteMode ? (
              /* Paste Mode Box */
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-800 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-0.5">명단 복사/붙여넣기 안내</p>
                    <p>
                      엑셀, 한글(HWP), 나이스(NEIS) 등의 학생 이름 열을 복사하여 아래에 붙여넣으세요.
                      <br />
                      한 줄에 한 명씩 또는 쉼표(,), 탭(Tab)으로 구분되어 있어도 자동으로 번호가 매겨집니다.
                    </p>
                  </div>
                </div>

                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  rows={9}
                  className="w-full p-3 font-mono text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="예시:&#10;강민준&#10;김도윤&#10;김서연&#10;1. 김시우&#10;02. 김지유"
                />

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setPasteMode(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleApplyPastedNames}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                  >
                    <Check className="w-4 h-4" />
                    명단 일괄 적용하기
                  </button>
                </div>
              </div>
            ) : (
              /* Regular Student List Table */
              <div className="space-y-4 flex-1 flex flex-col">
                {/* Fast generation helper */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 font-medium">빠른 번호 생성:</span>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={quickCount}
                      onChange={(e) => setQuickCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 px-2 py-1 text-xs border border-slate-300 rounded bg-white text-center font-bold"
                    />
                    <span className="text-xs text-slate-500">명</span>
                    <button
                      onClick={handleApplyQuickNumbers}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-200 px-2.5 py-1 rounded shadow-2xs hover:bg-indigo-50 transition-colors"
                    >
                      1~{quickCount}번 일괄생성
                    </button>
                  </div>

                  <button
                    onClick={handleAddStudent}
                    className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    학생 1명 추가
                  </button>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-y-auto max-h-[350px] border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100/80 text-xs font-semibold text-slate-600 sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4 w-20 text-center">번호</th>
                        <th className="py-2.5 px-4">이름</th>
                        <th className="py-2.5 px-4 w-16 text-center">삭제</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentClass.students.map((student, idx) => (
                        <tr key={student.id} className="hover:bg-slate-50/80">
                          <td className="py-1.5 px-4 text-center">
                            <input
                              type="number"
                              value={student.number}
                              onChange={(e) =>
                                handleStudentNumberChange(student.id, parseInt(e.target.value) || idx + 1)
                              }
                              className="w-14 text-center py-1 text-xs border border-slate-200 rounded font-semibold text-slate-700"
                            />
                          </td>
                          <td className="py-1.5 px-4">
                            <input
                              type="text"
                              value={student.name}
                              onChange={(e) => handleStudentNameChange(student.id, e.target.value)}
                              className="w-full py-1 px-2.5 text-xs sm:text-sm font-medium border border-transparent hover:border-slate-300 focus:border-indigo-500 rounded outline-none transition-colors"
                              placeholder="이름 입력"
                            />
                          </td>
                          <td className="py-1.5 px-4 text-center">
                            <button
                              onClick={() => handleDeleteStudent(student.id)}
                              className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors"
                              title="학생 삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {currentClass.students.length === 0 && (
                        <tr>
                          <td colSpan={3} className="text-center py-8 text-slate-400 text-xs">
                            등록된 학생이 없습니다. '학생 추가' 또는 '일괄 붙여넣기'를 이용하세요.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            총 학생수: <strong className="text-indigo-600 font-bold">{currentClass.students.length}명</strong>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
          >
            확인 및 완료
          </button>
        </div>
      </div>
    </div>
  );
};
