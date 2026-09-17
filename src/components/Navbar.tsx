import React from 'react';
import { 
  LayoutGrid, 
  Dices, 
  Users, 
  Timer, 
  UserCheck, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Github, 
  Sparkles 
} from 'lucide-react';
import { ToolId, ClassPreset } from '../types';
import { sound } from '../utils/sound';

interface NavbarProps {
  currentTool: ToolId;
  onSelectTool: (tool: ToolId) => void;
  classes: ClassPreset[];
  activeClassId: string;
  onSelectClass: (id: string) => void;
  onOpenRosterModal: () => void;
  onOpenGithubGuide: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTool,
  onSelectTool,
  classes,
  activeClassId,
  onSelectClass,
  onOpenRosterModal,
  onOpenGithubGuide,
  soundEnabled,
  onToggleSound,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  React.useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const tools: { id: ToolId; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'seat', label: '자리뽑기', icon: <LayoutGrid className="w-4 h-4" />, desc: '교실 책상 배치 & 추첨' },
    { id: 'number', label: '번호/이름 뽑기', icon: <Dices className="w-4 h-4" />, desc: '발표자 및 당번 추첨' },
    { id: 'team', label: '모둠 편성', icon: <Users className="w-4 h-4" />, desc: '랜덤 조/팀 구성' },
    { id: 'timer', label: '수업 타이머', icon: <Timer className="w-4 h-4" />, desc: '활동 시간 & 스톱워치' },
  ];

  const currentClass = classes.find((c) => c.id === activeClassId);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900">
                  클래스툴
                </h1>
                <span className="text-[11px] font-semibold uppercase px-1.5 py-0.5 rounded-sm bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  ClassTool
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                수업에 바로 쓰는 선생님 맞춤 교실 유틸리티
              </p>
            </div>
          </div>

          {/* Tool Navigation Switcher */}
          <nav className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 overflow-x-auto scrollbar-none max-w-full">
            {tools.map((tool) => {
              const isActive = currentTool === tool.id;
              return (
                <button
                  key={tool.id}
                  id={`nav-tool-${tool.id}`}
                  onClick={() => {
                    onSelectTool(tool.id);
                    sound.playPop();
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-indigo-600 shadow-xs font-bold border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                  title={tool.desc}
                >
                  <span className={isActive ? 'text-indigo-600' : 'text-slate-500'}>
                    {tool.icon}
                  </span>
                  <span>{tool.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Roster Selector & Utility Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Active Class Dropdown */}
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-lg pl-2 pr-1 py-1 hover:border-slate-300 transition-colors">
              <span className="text-xs font-medium text-slate-500 mr-1 hidden lg:inline">학급:</span>
              <select
                id="header-class-select"
                value={activeClassId}
                onChange={(e) => onSelectClass(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-semibold text-slate-800 outline-none cursor-pointer pr-1"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.students.length}명)
                  </option>
                ))}
              </select>

              <button
                id="btn-open-roster-manage"
                onClick={onOpenRosterModal}
                className="ml-1 p-1 hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 rounded-md transition-colors"
                title="학급 및 학생 명단 관리 (학생 추가/수정/엑셀 붙여넣기)"
              >
                <UserCheck className="w-4 h-4" />
              </button>
            </div>

            {/* Sound Toggle */}
            <button
              id="btn-sound-toggle"
              onClick={onToggleSound}
              className={`p-2 rounded-lg border transition-colors ${
                soundEnabled
                  ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  : 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100'
              }`}
              title={soundEnabled ? '효과음 켜짐 (클릭하여 음소거)' : '효과음 꺼짐 (클릭하여 켜기)'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Fullscreen Toggle */}
            <button
              id="btn-fullscreen-toggle"
              onClick={toggleFullscreen}
              className="p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors hidden sm:flex items-center justify-center"
              title={isFullscreen ? '전체화면 종료' : '전자칠판/스크린 전체화면'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* GitHub Pages Deploy Guide */}
            <button
              id="btn-github-guide"
              onClick={onOpenGithubGuide}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
              title="GitHub Pages 배포 및 다운로드 가이드"
            >
              <Github className="w-4 h-4" />
              <span className="hidden xl:inline">GitHub Pages 배포</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
