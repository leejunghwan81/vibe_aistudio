import React, { useState } from 'react';
import { X, Github, Check, Copy, ExternalLink, Terminal, ShieldCheck, Sparkles } from 'lucide-react';

interface GitHubGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubGuideModal: React.FC<GitHubGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const actionWorkflowYaml = `name: Deploy to GitHub Pages

on:
  push:
    branches: ['main']

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div 
        id="github-guide-modal"
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-900 text-white rounded-lg">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">GitHub Pages 게시 & 배포 가이드</h2>
              <p className="text-xs text-slate-500">
                본 프로젝트는 GitHub Pages 정적 호스팅에 100% 최적화되어 있습니다.
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {/* Compatibility badge box */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-emerald-950 text-sm">GitHub Pages 호환성 완벽 설정 완료</p>
              <ul className="list-disc list-inside space-y-0.5 text-emerald-800">
                <li><code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">base: './'</code> 상대 경로 설정 적용 (저장소 서브경로에서도 깨짐 없음)</li>
                <li>별도 백엔드 서버 없이 브라우저 단독 실행 (Client-Side SPA)</li>
                <li>학급 명단과 설정은 브라우저 <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">localStorage</code>에 자동 영구 저장</li>
                <li>Web Audio API를 내장하여 외부 오디오 파일 다운로드 없이 100% 오프라인 작동</li>
              </ul>
            </div>
          </div>

          {/* Method 1: GitHub Actions (Recommended) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                1
              </span>
              <h3 className="font-bold text-slate-900 text-base">
                가장 쉬운 자동 배포: GitHub Actions 사용 (추천)
              </h3>
            </div>

            <ol className="list-decimal list-inside space-y-2 text-slate-600 pl-2 text-xs sm:text-sm">
              <li>
                GitHub에 본 저장소를 푸시한 뒤, 저장소의 <strong>Settings &gt; Pages</strong>로 이동합니다.
              </li>
              <li>
                <strong>Build and deployment &gt; Source</strong> 항목을 <strong>"GitHub Actions"</strong>로 선택합니다.
              </li>
              <li>
                저장소 루트에 <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono">.github/workflows/deploy.yml</code> 파일을 만들고 아래 코드를 붙여넣습니다:
              </li>
            </ol>

            <div className="relative bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto">
              <button
                onClick={() => copyToClipboard(actionWorkflowYaml, 'action')}
                className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md text-[11px] border border-slate-700 transition-colors"
              >
                {copiedCode === 'action' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode === 'action' ? '복사됨' : '복사'}</span>
              </button>
              <pre>{actionWorkflowYaml}</pre>
            </div>
          </div>

          {/* Method 2: Manual Local Build & Export */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                2
              </span>
              <h3 className="font-bold text-slate-900 text-base">
                로컬에서 빌드 후 수동 업로드하기
              </h3>
            </div>

            <p className="text-slate-600 text-xs sm:text-sm">
              터미널에서 아래 명령어를 실행하면 <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-indigo-600">dist/</code> 폴더에 정적 HTML/CSS/JS 파일이 생성됩니다.
            </p>

            <div className="bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-xs flex items-center justify-between">
              <code>npm run build</code>
              <button
                onClick={() => copyToClipboard('npm run build', 'build')}
                className="text-slate-400 hover:text-white"
              >
                {copiedCode === 'build' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <p className="text-slate-500 text-xs">
              생성된 <code className="font-mono text-slate-700">dist</code> 폴더 내의 파일들을 GitHub 저장소의 <code className="font-mono text-slate-700">gh-pages</code> 브랜치에 올리거나, 학교 서버, 일반 웹호스팅에 그대로 업로드하셔도 즉시 작동합니다.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
