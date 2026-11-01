import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Crown, Flag, Mountain, Rocket } from 'lucide-react';
import { cn } from '@project/components/lib/utils';
import { fmtMinutes, progress, type Progress } from '../lib/progress';

type Lesson = { id: string; title: string; level: string; order: number; youTubeVideoId: string; durationMinutes: number; channelName: string | null; summary: string | null };

const LEVELS = [
  { name: 'Beginner', icon: Flag, hue: 158 },
  { name: 'Intermediate', icon: Rocket, hue: 200 },
  { name: 'Advanced', icon: Mountain, hue: 280 },
  { name: 'Master', icon: Crown, hue: 38 },
];

export default function LevelTimeline({ courseId, lessons, p }: { courseId: string; lessons: Lesson[]; p: Progress }) {
  return (
    <div className="relative">
      <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-primary via-[hsl(280_60%_55%)] to-[hsl(var(--highlight))] opacity-40" />
      {LEVELS.map(({ name, icon: Icon, hue }, li) => {
        const ls = lessons.filter((l) => l.level === name);
        if (!ls.length) return null;
        const done = ls.filter((l) => p.completed[l.id]).length;
        const complete = done === ls.length;
        return (
          <motion.div key={name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative pl-16 mb-10">
            <div className={cn('absolute left-0 top-0 h-12 w-12 rounded-2xl grid place-items-center shadow-lg ring-4 ring-background', complete && 'animate-pulse')}
              style={{ background: `linear-gradient(135deg, hsl(${hue} 70% 45%), hsl(${hue + 30} 80% 55%))`, color: 'white' }}>
              {complete ? <Check className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
            </div>
            <div className="flex items-end justify-between mb-3 gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: `hsl(${hue} 60% 40%)` }}>Level {li + 1}</div>
                <h2 className="text-2xl font-extrabold">{name}</h2>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-semibold">{done}/{ls.length}</div>
                <div className="h-1.5 w-28 bg-muted rounded-full overflow-hidden mt-1">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(done / ls.length) * 100}%`, background: `hsl(${hue} 65% 45%)` }} />
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              {ls.map((l) => {
                const isDone = !!p.completed[l.id];
                return (
                  <div key={l.id} className={cn('group flex items-center gap-3 p-2 pr-4 rounded-xl border bg-card transition-all hover:shadow-md hover:-translate-y-0.5', isDone ? 'border-transparent opacity-75' : 'border-border')}>
                    <Link to={`/course/${courseId}/lesson/${l.id}`} className="relative w-28 sm:w-36 aspect-video rounded-lg overflow-hidden shrink-0 bg-muted">
                      <img src={`https://i.ytimg.com/vi/${l.youTubeVideoId}/mqdefault.jpg`} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <span className="absolute bottom-1 right-1 bg-black/75 text-white text-[10px] px-1.5 rounded">{fmtMinutes(l.durationMinutes ?? 0)}</span>
                      {isDone && <span className="absolute inset-0 bg-primary/60 grid place-items-center"><Check className="h-6 w-6 text-white" /></span>}
                    </Link>
                    <Link to={`/course/${courseId}/lesson/${l.id}`} className="flex-1 min-w-0">
                      <div className={cn('text-sm', isDone ? 'text-muted-foreground line-through decoration-primary/50' : 'font-semibold')}>{l.order}. {l.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{l.summary}</div>
                      <div className="text-[11px] text-muted-foreground/80 mt-0.5">{l.channelName}</div>
                    </Link>
                    <button aria-label="Toggle complete" onClick={() => progress.toggle(courseId, l.id, l.durationMinutes ?? 0)}
                      className={cn('h-7 w-7 rounded-full border-2 grid place-items-center shrink-0 transition-colors', isDone ? 'bg-primary border-primary text-primary-foreground' : 'border-border hover:border-primary')}>
                      {isDone && <Check className="h-4 w-4" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
