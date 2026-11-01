import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Circle, Play } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@project/components/ui/button';
import { Skeleton } from '@project/components/ui/skeleton';
import { Textarea } from '@project/components/ui/textarea';
import { cn } from '@project/components/lib/utils';
import YouTubePlayer from '../components/YouTubePlayer';
import { useCourse } from '../lib/data';
import { fmtMinutes, progress, useProgress } from '../lib/progress';

export default function LessonPage() {
  const { courseId = '', lessonId = '' } = useParams();
  const { data, isLoading } = useCourse(courseId);
  const p = useProgress();
  const navigate = useNavigate();
  const lessons = data?.lessons ?? [];
  const idx = lessons.findIndex((l) => l.id === lessonId);
  const lesson = lessons[idx];
  const prev = lessons[idx - 1];
  const next = lessons[idx + 1];
  const go = (id?: string) => id && navigate(`/course/${courseId}/lesson/${id}`);

  const completeAndNext = () => {
    if (!lesson) return;
    progress.toggle(courseId, lesson.id, lesson.durationMinutes ?? 0, true);
    if (next) go(next.id);
    else toast.success('Course complete! 🎉 You went from zero to master.');
  };

  useEffect(() => { if (lesson) progress.visit(courseId, lesson.id); }, [lesson?.id]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, textarea')) return;
      if (e.key === 'n') go(next?.id);
      if (e.key === 'p') go(prev?.id);
      if (e.key === 'm' && lesson) progress.toggle(courseId, lesson.id, lesson.durationMinutes ?? 0);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  if (isLoading) return <div className="container mx-auto px-4 py-6"><Skeleton className="aspect-video w-full max-w-4xl" /></div>;
  if (!data || !lesson) return <div className="container mx-auto px-4 py-20 text-center">Lesson not found. <Link to="/" className="text-primary">Go home</Link></div>;
  const done = lessons.filter((l) => p.completed[l.id]).length;
  const isDone = !!p.completed[lesson.id];

  return (
    <div className="container mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
      <div className="flex-1 min-w-0">
        <Link to={`/course/${courseId}`} className="text-sm text-muted-foreground inline-flex items-center gap-1 mb-3 hover:text-foreground"><ArrowLeft className="h-4 w-4" />{data.course.title}</Link>
        <YouTubePlayer videoId={lesson.youTubeVideoId} onEnded={completeAndNext} />
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mt-4">
          <div>
            <h1 className="text-2xl font-bold">{lesson.order}. {lesson.title}</h1>
            <div className="text-sm text-muted-foreground">{lesson.level} · {lesson.channelName} · {fmtMinutes(lesson.durationMinutes ?? 0)}</div>
            {lesson.summary && <p className="text-sm mt-2 max-w-2xl">{lesson.summary}</p>}
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" disabled={!prev} onClick={() => go(prev?.id)}><ChevronLeft className="h-4 w-4" />Previous</Button>
            {isDone ? (
              <Button variant="secondary" onClick={() => next ? go(next.id) : progress.toggle(courseId, lesson.id, 0, false)}>
                {next ? <>Next<ChevronRight className="h-4 w-4" /></> : 'Mark incomplete'}
              </Button>
            ) : (
              <Button onClick={completeAndNext}><CheckCircle2 className="h-4 w-4 mr-1" />Mark complete{next ? ' & next' : ''}</Button>
            )}
          </div>
        </div>
        <div className="mt-5">
          <div className="text-sm font-semibold mb-1.5">My notes</div>
          <Textarea
            value={p.notes[lesson.id] ?? ''}
            onChange={(e) => progress.setNote(lesson.id, e.target.value)}
            placeholder="Write what you learned. Notes save automatically in this browser."
            className="min-h-28 bg-card"
          />
          <div className="text-xs text-muted-foreground mt-2">Shortcuts: <kbd>N</kbd> next · <kbd>P</kbd> previous · <kbd>M</kbd> toggle complete. Lessons auto-complete when the video ends.</div>
        </div>
      </div>
      <aside className="lg:w-80 shrink-0 border border-border rounded-xl bg-card self-start lg:sticky lg:top-20 max-h-[80vh] flex flex-col">
        <div className="p-3 border-b border-border text-sm font-semibold">Lessons · {done}/{lessons.length}</div>
        <div className="overflow-y-auto">
          {lessons.map((l) => (
            <Link key={l.id} to={`/course/${courseId}/lesson/${l.id}`}
              className={cn('flex items-start gap-2 p-3 text-sm border-b border-border/60 last:border-0', l.id === lesson.id ? 'bg-accent text-accent-foreground font-medium' : 'hover:bg-secondary/60')}>
              {l.id === lesson.id ? <Play className="h-4 w-4 mt-0.5 shrink-0" /> : p.completed[l.id] ? <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" /> : <Circle className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />}
              <span className="flex-1">{l.order}. {l.title}</span>
              <span className="text-xs text-muted-foreground">{fmtMinutes(l.durationMinutes ?? 0)}</span>
            </Link>
          ))}
        </div>
      </aside>
    </div>
  );
}
