import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SeatPicker } from './components/SeatPicker/SeatPicker';
import { NumberPicker } from './components/NumberPicker/NumberPicker';
import { TeamMaker } from './components/TeamMaker/TeamMaker';
import { ClassTimer } from './components/Timer/ClassTimer';
import { RosterModal } from './components/RosterManager/RosterModal';
import { GitHubGuideModal } from './components/GitHubGuideModal';
import { ToolId, ClassPreset } from './types';
import { loadClasses, saveClasses, loadActiveId, saveActiveId } from './utils/storage';
import { sound } from './utils/sound';
import { Sparkles, Github, Heart } from 'lucide-react';

export default function App() {
  const [classes, setClasses] = useState<ClassPreset[]>(() => loadClasses());
  const [activeClassId, setActiveClassId] = useState<string>(() => loadActiveId(classes));
  const [currentTool, setCurrentTool] = useState<ToolId>('seat');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Modals
  const [isRosterModalOpen, setIsRosterModalOpen] = useState<boolean>(false);
  const [isGithubGuideOpen, setIsGithubGuideOpen] = useState<boolean>(false);

  // Save changes to localStorage
  const handleUpdateClasses = (newClasses: ClassPreset[], newActiveId?: string) => {
    setClasses(newClasses);
    saveClasses(newClasses);
    if (newActiveId) {
      setActiveClassId(newActiveId);
      saveActiveId(newActiveId);
    }
  };

  const handleSelectClass = (id: string) => {
    setActiveClassId(id);
    saveActiveId(id);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
    if (next) sound.playPop();
  };

  const currentClass = classes.find((c) => c.id === activeClassId) || classes[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navigation Header */}
      <Navbar
        currentTool={currentTool}
        onSelectTool={setCurrentTool}
        classes={classes}
        activeClassId={activeClassId}
        onSelectClass={handleSelectClass}
        onOpenRosterModal={() => setIsRosterModalOpen(true)}
        onOpenGithubGuide={() => setIsGithubGuideOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main Classroom Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-5 sm:py-7">
        {currentTool === 'seat' && (
          <SeatPicker currentClass={currentClass} soundEnabled={soundEnabled} />
        )}

        {currentTool === 'number' && (
          <NumberPicker currentClass={currentClass} soundEnabled={soundEnabled} />
        )}

        {currentTool === 'team' && (
          <TeamMaker currentClass={currentClass} soundEnabled={soundEnabled} />
        )}

        {currentTool === 'timer' && (
          <ClassTimer soundEnabled={soundEnabled} />
        )}
      </main>

      {/* Subtle Classroom Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 px-6 text-center text-xs text-slate-500 print:hidden mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium text-slate-600">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>선생님과 학생을 위한 교실 수업 도우미 - <strong>클래스툴</strong></span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>브라우저 로컬 저장으로 오프라인 및 학교 인트라넷 지원</span>
            <button
              onClick={() => setIsGithubGuideOpen(true)}
              className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline flex items-center gap-1"
            >
              <Github className="w-3.5 h-3.5" />
              GitHub Pages 배포 안내
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <RosterModal
        isOpen={isRosterModalOpen}
        onClose={() => setIsRosterModalOpen(false)}
        classes={classes}
        activeClassId={activeClassId}
        onUpdateClasses={handleUpdateClasses}
      />

      <GitHubGuideModal
        isOpen={isGithubGuideOpen}
        onClose={() => setIsGithubGuideOpen(false)}
      />
    </div>
  );
}
