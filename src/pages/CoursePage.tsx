import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, PlayCircle, Youtube } from 'lucide-react';
import { Button } from '@project/components/ui/button';
import { Skeleton } from '@project/components/ui/skeleton';
import { Progress as Bar } from '@project/components/ui/progress';
import { useCourse } from '../lib/data';
import LevelTimeline from '../components/LevelTimeline';
import { fmtMinutes, useProgress } from '../lib/progress';


export default function CoursePage() {
  const { courseId = '' } = useParams();
  const { data, isLoading, error } = useCourse(courseId);
  const p = useProgress();
  const navigate = useNavigate();

  if (isLoading) return <div className="container mx-auto px-4 py-10 space-y-4"><Skeleton className="h-48" /><Skeleton className="h-96" /></div>;
  if (error || !data) return <div className="container mx-auto px-4 py-20 text-center">Course not found. <Link to="/" className="text-primary">Go home</Link></div>;

  const { course, lessons } = data;
  const done = lessons.filter((l) => p.completed[l.id]).length;
  const pct = lessons.length ? Math.round((done / lessons.length) * 100) : 0;
  const leftMin = lessons.filter((l) => !p.completed[l.id]).reduce((s, l) => s + (l.durationMinutes ?? 0), 0);
  const next = lessons.find((l) => !p.completed[l.id]) ?? lessons[0];

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-accent via-background to-secondary">
        {course.thumbnailUrl && <img src={course.thumbnailUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-2xl scale-110" />}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="relative container mx-auto px-4 py-10 flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <Link to="/" className="text-sm text-muted-foreground inline-flex items-center gap-1 mb-4 hover:text-foreground"><ArrowLeft className="h-4 w-4" />All courses</Link>
            <div className="text-xs uppercase tracking-wide text-primary font-semibold">{[course.field, course.skillName].filter(Boolean).join(' · ')}</div>
            <h1 className="text-3xl md:text-5xl font-extrabold mt-1">{course.title}</h1>
            {course.description && <p className="text-muted-foreground mt-3 max-w-2xl">{course.description}</p>}
            {course.creatorName && (
              <a href={course.creatorChannelUrl ?? '#'} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-4 text-sm hover:text-primary">
                <Youtube className="h-5 w-5 text-destructive" />Taught by {course.creatorName}
              </a>
            )}
            {next && (
              <div className="mt-6">
                <Button size="lg" onClick={() => navigate(`/course/${course.id}/lesson/${next.id}`)}>
                  <PlayCircle className="h-5 w-5 mr-2" />{done === 0 ? 'Start course' : done === lessons.length ? 'Watch again' : `Resume lesson ${next.order}`}
                </Button>
              </div>
            )}
          </div>
          <div className="lg:w-80 bg-card border border-border rounded-2xl p-5 self-start shadow-sm">
            <div className="text-sm font-semibold">Your progress</div>
            <div className="text-4xl font-display font-extrabold mt-1">{pct}%</div>
            <Bar value={pct} className="h-2 mt-3" />
            <div className="text-xs text-muted-foreground mt-2">{done} of {lessons.length} lessons · {fmtMinutes(leftMin)} left</div>
          </div>
        </div>
      </section>
      <section className="container mx-auto px-4 py-8 max-w-4xl">
        <LevelTimeline courseId={course.id} lessons={lessons} p={p} />
      </section>
    </>
  );
}
