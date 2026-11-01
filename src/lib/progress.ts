import { useSyncExternalStore } from 'react';

export type Progress = {
  completed: Record<string, { at: string; minutes: number; courseId: string }>;
  last: Record<string, { lessonId: string; at: string }>;
  notes: Record<string, string>;
  goalMinutes?: number;
};

const KEY = 'openskill-progress-v1';
const empty: Progress = { completed: {}, last: {}, notes: {} };
let state: Progress = load();
const listeners = new Set<() => void>();

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...empty, ...JSON.parse(raw) } : empty;
  } catch {
    return empty;
  }
}

function set(next: Progress) {
  state = next;
  localStorage.setItem(KEY, JSON.stringify(next));
  listeners.forEach((l) => l());
}

export function useProgress() {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => state,
  );
}

export const progress = {
  toggle(courseId: string, lessonId: string, minutes: number, done?: boolean) {
    const completed = { ...state.completed };
    const isDone = done ?? !completed[lessonId];
    if (isDone) completed[lessonId] = { at: new Date().toISOString(), minutes, courseId };
    else delete completed[lessonId];
    set({ ...state, completed, last: { ...state.last, [courseId]: { lessonId, at: new Date().toISOString() } } });
  },
  visit(courseId: string, lessonId: string) {
    set({ ...state, last: { ...state.last, [courseId]: { lessonId, at: new Date().toISOString() } } });
  },
  setNote(lessonId: string, text: string) {
    set({ ...state, notes: { ...state.notes, [lessonId]: text } });
  },
  setGoal(minutes: number) {
    set({ ...state, goalMinutes: minutes });
  },
  export() {
    return JSON.stringify(state, null, 2);
  },
  import(json: string) {
    const parsed = JSON.parse(json);
    if (typeof parsed !== 'object' || !parsed.completed) throw new Error('Not a valid progress file');
    set({ ...empty, ...parsed });
  },
  reset() {
    set(empty);
  },
};

export function streak(p: Progress) {
  const key = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const days = new Set(Object.values(p.completed).map((c) => key(new Date(c.at))));
  let n = 0;
  const d = new Date();
  if (!days.has(key(d))) d.setDate(d.getDate() - 1);
  while (days.has(key(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

export function minutesByDay(p: Progress, days = 7) {
  const totals = new Map<string, number>();
  Object.values(p.completed).forEach((c) => {
    const k = dayKey(new Date(c.at));
    totals.set(k, (totals.get(k) ?? 0) + c.minutes);
  });
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    return {
      day: d.toLocaleDateString(undefined, { weekday: 'short' }),
      minutes: Math.round(totals.get(dayKey(d)) ?? 0),
    };
  });
}

export const todayMinutes = (p: Progress) => minutesByDay(p, 1)[0].minutes;

export function fmtMinutes(m: number) {
  if (m < 60) return `${Math.round(m)}m`;
  return `${Math.floor(m / 60)}h ${Math.round(m % 60)}m`;
}
