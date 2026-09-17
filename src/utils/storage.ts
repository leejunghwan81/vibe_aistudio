import { ClassPreset, Student } from '../types';

const STORAGE_KEY_CLASSES = 'classtool_classes_v1';
const STORAGE_KEY_ACTIVE_CLASS = 'classtool_active_class_v1';

// Initial sample class with realistic Korean names
const DEFAULT_CLASS_1: ClassPreset = {
  id: 'class-1',
  name: '3학년 2반 (24명)',
  students: [
    { id: 's1', number: 1, name: '강민준', gender: 'M' },
    { id: 's2', number: 2, name: '김도윤', gender: 'M' },
    { id: 's3', number: 3, name: '김서연', gender: 'F' },
    { id: 's4', number: 4, name: '김시우', gender: 'M' },
    { id: 's5', number: 5, name: '김지유', gender: 'F' },
    { id: 's6', number: 6, name: '김하은', gender: 'F' },
    { id: 's7', number: 7, name: '문예준', gender: 'M' },
    { id: 's8', number: 8, name: '박서준', gender: 'M' },
    { id: 's9', number: 9, name: '박수아', gender: 'F' },
    { id: 's10', number: 10, name: '박지호', gender: 'M' },
    { id: 's11', number: 11, name: '배유진', gender: 'F' },
    { id: 's12', number: 12, name: '송민재', gender: 'M' },
    { id: 's13', number: 13, name: '신채원', gender: 'F' },
    { id: 's14', number: 14, name: '안지안', gender: 'F' },
    { id: 's15', number: 15, name: '오은우', gender: 'M' },
    { id: 's16', number: 16, name: '윤서아', gender: 'F' },
    { id: 's17', number: 17, name: '이도현', gender: 'M' },
    { id: 's18', number: 18, name: '이시아', gender: 'F' },
    { id: 's19', number: 19, name: '이준우', gender: 'M' },
    { id: 's20', number: 20, name: '이지우', gender: 'F' },
    { id: 's21', number: 21, name: '임예나', gender: 'F' },
    { id: 's22', number: 22, name: '정현우', gender: 'M' },
    { id: 's23', number: 23, name: '조유나', gender: 'F' },
    { id: 's24', number: 24, name: '최주원', gender: 'M' },
  ],
};

const DEFAULT_CLASS_2: ClassPreset = {
  id: 'class-2',
  name: '동아리/특활 (15명)',
  students: Array.from({ length: 15 }, (_, i) => ({
    id: `c2-s${i + 1}`,
    number: i + 1,
    name: `${i + 1}번 학생`,
  })),
};

export function loadClasses(): ClassPreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CLASSES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return [DEFAULT_CLASS_1, DEFAULT_CLASS_2];
}

export function saveClasses(classes: ClassPreset[]) {
  try {
    localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(classes));
  } catch {
    // ignore
  }
}

export function loadActiveId(classes: ClassPreset[]): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_CLASS);
    if (saved && classes.some((c) => c.id === saved)) {
      return saved;
    }
  } catch {
    // ignore
  }
  return classes[0]?.id || '';
}

export function saveActiveId(id: string) {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_CLASS, id);
  } catch {
    // ignore
  }
}

/**
 * Parses names pasted from Excel / NEIS / Text
 * Supports:
 * - One name per line (with or without numbers like "1. 홍길동" or "1 홍길동")
 * - Comma or tab separated names
 */
export function parsePastedNames(text: string): Student[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const students: Student[] = [];
  let currentNum = 1;

  for (const line of lines) {
    // Split by tab or multiple spaces if it looks like a table row
    const parts = line.split(/[\t,]+/).map((p) => p.trim()).filter(Boolean);

    for (const part of parts) {
      // Remove leading number if present (e.g. "1. 김철수", "1번 김철수", "01 김철수")
      const cleanName = part.replace(/^(\d+[\.\s번\-\)]*)/, '').trim();
      if (cleanName) {
        students.push({
          id: `s-${Date.now()}-${currentNum}-${Math.random().toString(36).substr(2, 4)}`,
          number: currentNum,
          name: cleanName,
        });
        currentNum++;
      }
    }
  }

  return students;
}
