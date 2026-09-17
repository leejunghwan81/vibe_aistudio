import React, { useState } from 'react';
import { Users, Shuffle, Crown, Copy, Check, Printer, Sparkles } from 'lucide-react';
import { ClassPreset, Student } from '../../types';
import { sound } from '../../utils/sound';
import { fireConfetti } from '../../utils/confetti';

interface TeamMakerProps {
  currentClass: ClassPreset;
  soundEnabled: boolean;
}

interface Team {
  id: number;
  name: string;
  leaderId?: string;
  members: Student[];
}

export const TeamMaker: React.FC<TeamMakerProps> = ({ currentClass }) => {
  const [splitMode, setSplitMode] = useState<'byTeamCount' | 'byMemberCount'>('byTeamCount');
  const [teamCount, setTeamCount] = useState<number>(4);
  const [memberCount, setMemberCount] = useState<number>(4);
  const [assignLeader, setAssignLeader] = useState<boolean>(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [copied, setCopied] = useState<boolean>(false);

  const handleGenerateTeams = () => {
    const students = [...currentClass.students];
    if (students.length === 0) {
      alert('학생 명단이 비어 있습니다.');
      return;
    }

    // Shuffle students
    for (let i = students.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [students[i], students[j]] = [students[j], students[i]];
    }

    let calculatedNumTeams = teamCount;
    if (splitMode === 'byMemberCount') {
      calculatedNumTeams = Math.max(1, Math.ceil(students.length / memberCount));
    }

    const newTeams: Team[] = Array.from({ length: calculatedNumTeams }, (_, i) => ({
      id: i + 1,
      name: `${i + 1}모둠`,
      members: [],
    }));

    // Distribute students evenly into teams
    students.forEach((student, index) => {
      const targetTeam = newTeams[index % calculatedNumTeams];
      targetTeam.members.push(student);
    });

    // Assign leader
    if (assignLeader) {
      newTeams.forEach((t) => {
        if (t.members.length > 0) {
          const leaderIdx = Math.floor(Math.random() * t.members.length);
          t.leaderId = t.members[leaderIdx].id;
        }
      });
    }

    setTeams(newTeams);
    sound.playFanfare();
    fireConfetti();
  };

  const handleCopyTeams = () => {
    if (teams.length === 0) return;

    let text = `[${currentClass.name} 모둠 편성표]\n\n`;
    teams.forEach((t) => {
      text += `★ ${t.name} (${t.members.length}명)\n`;
      t.members.forEach((m) => {
        const isLeader = m.id === t.leaderId;
        text += `  - ${m.number}번 ${m.name}${isLeader ? ' (★조장)' : ''}\n`;
      });
      text += '\n';
    });

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs print:hidden space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Split Mode Choice */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setSplitMode('byTeamCount')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  splitMode === 'byTeamCount'
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                모둠 수 기준 (N개 모둠 만들기)
              </button>
              <button
                onClick={() => setSplitMode('byMemberCount')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  splitMode === 'byMemberCount'
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                인원 수 기준 (모둠당 N명씩)
              </button>
            </div>

            {/* Numeric input */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
              <span className="font-semibold text-slate-700">
                {splitMode === 'byTeamCount' ? '모둠 수:' : '모둠당 인원:'}
              </span>
              <input
                type="number"
                min={2}
                max={20}
                value={splitMode === 'byTeamCount' ? teamCount : memberCount}
                onChange={(e) => {
                  const val = Math.max(2, Math.min(20, parseInt(e.target.value) || 2));
                  if (splitMode === 'byTeamCount') setTeamCount(val);
                  else setMemberCount(val);
                }}
                className="w-14 text-center py-0.5 border border-slate-300 rounded font-bold bg-white"
              />
              <span className="text-slate-500 font-medium">
                {splitMode === 'byTeamCount' ? '개 조' : '명'}
              </span>
            </div>

            {/* Leader toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs">
              <input
                type="checkbox"
                checked={assignLeader}
                onChange={(e) => setAssignLeader(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                모둠장 랜덤 지정
              </span>
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {teams.length > 0 && (
              <>
                <button
                  onClick={handleCopyTeams}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? '복사됨' : '명단 복사'}</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>인쇄</span>
                </button>
              </>
            )}

            <button
              onClick={handleGenerateTeams}
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-all active:scale-95"
            >
              <Shuffle className="w-4 h-4" />
              <span>랜덤 모둠 편성!</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Header */}
      <div className="hidden print:block w-full mb-6 pb-3 border-b-2 border-slate-800 text-center">
        <h2 className="text-2xl font-black text-slate-900">{currentClass.name} 모둠 편성표</h2>
        <p className="text-xs text-slate-500 mt-1">
          출력일자: {new Date().toLocaleDateString('ko-KR')} | 총 {currentClass.students.length}명
        </p>
      </div>

      {/* Teams Grid */}
      {teams.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-colors"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-black text-sm flex items-center justify-center">
                    {team.id}
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-base">{team.name}</h4>
                </div>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {team.members.length}명
                </span>
              </div>

              {/* Members */}
              <ul className="space-y-1.5 flex-1">
                {team.members.map((member) => {
                  const isLeader = member.id === team.leaderId;
                  return (
                    <li
                      key={member.id}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold ${
                        isLeader
                          ? 'bg-amber-50 text-amber-900 border border-amber-200'
                          : 'bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold ${isLeader ? 'text-amber-600' : 'text-slate-400'}`}>
                          {member.number}번
                        </span>
                        <span className="font-bold text-sm">{member.name}</span>
                      </div>
                      {isLeader && (
                        <span className="flex items-center gap-1 text-[11px] font-extrabold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-md">
                          <Crown className="w-3 h-3 text-amber-500 fill-amber-500" />
                          모둠장
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            원하는 모둠 수 또는 인원을 정하고 '랜덤 모둠 편성'을 누르세요
          </h3>
          <p className="text-xs text-slate-400">
            {currentClass.name} 학생 {currentClass.students.length}명을 무작위로 골고루 나누어 드립니다.
          </p>
        </div>
      )}
    </div>
  );
};
