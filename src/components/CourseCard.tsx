import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, PlayCircle } from 'lucide-react';
import { Progress as Bar } from '@project/components/ui/progress';
import type { CatalogCourse } from '../lib/data';
import { fmtMinutes, useProgress } from '../lib/progress';

export default function CourseCard({ c }: { c: CatalogCourse }) {
  const p = useProgress();
  const done = Object.values(p.completed).filter((x) => x.courseId === c.id).length;
  const pct = c.lessonCount ? Math.round((done / c.lessonCount) * 100) : 0;
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
    <Link to={`/course/${c.id}`} className="group block">
      <div className="aspect-video rounded-xl overflow-hidden bg-muted relative shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300">
        {c.thumbnailUrl && (
          <img src={c.thumbnailUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        )}
        <span className="absolute bottom-2 right-2 bg-foreground/80 text-background text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1">
          <Clock className="h-3 w-3" />{fmtMinutes(c.totalMinutes)}
        </span>
        <PlayCircle className="absolute inset-0 m-auto h-12 w-12 text-white opacity-0 group-hover:opacity-90 transition-opacity" />
      </div>
      <div className="mt-2.5">
        <div className="text-[11px] uppercase tracking-wide text-primary font-semibold">{c.field ?? 'Skill'}</div>
        <div className="font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">{c.title}</div>
        <div className="text-xs text-muted-foreground mt-0.5 truncate">{c.creatorName} · {c.lessonCount} lessons</div>
        {done > 0 && <Bar value={pct} className="h-1.5 mt-2" />}
      </div>
    </Link>
    </motion.div>
  );
}
