export type ToolId = 'seat' | 'number' | 'timer' | 'team';

export interface Student {
  id: string;
  number: number;
  name: string;
  gender?: 'M' | 'F' | 'OTHER';
}

export interface ClassPreset {
  id: string;
  name: string;
  students: Student[];
}

export interface SeatItem {
  row: number;
  col: number;
  studentId: string | null; // assigned student
  fixedStudentId: string | null; // pinned student
  disabled: boolean; // empty space/aisle
  revealed: boolean;
}

export type SeatPerspective = 'teacher' | 'student'; // 교사 시점 (교탁이 위) vs 학생 시점 (교탁을 바라봄)

export type SeatLayoutMode = 'single' | 'pair'; // 단독 책상 vs 짝꿍 책상

export interface NumberDrawHistoryItem {
  timestamp: number;
  selected: Student[];
}
