import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@project/components/ui/button';
import { Skeleton } from '@project/components/ui/skeleton';
import { Progress as Bar } from '@project/components/ui/progress';
import { cn } from '@project/components/lib/utils';
import CourseCard from '../components/CourseCard';
import { TodayGoalBanner } from '../components/Goals';
import { Hero, FieldGrid } from '../components/Hero';
import { useCatalog, useSkills, type CatalogCourse } from '../lib/data';
import { useProgress } from '../lib/progress';

function ContinueLearning({ courses }: { courses: CatalogCourse[] }) {
  const p = useProgress();
  const started = Object.entries(p.last)
    .sort((a, b) => b[1].at.localeCompare(a[1].at))
    .map(([id]) => courses.find((c) => c.id === id))
    .filter((c): c is CatalogCourse => !!c)
    .slice(0, 3);
  if (!started.length) return null;
  return (
    <section className="container mx-auto px-4 pt-8">
      <h2 className="text-xl font-bold mb-3">Continue learning</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {started.map((c) => {
          const done = Object.values(p.completed).filter((x) => x.courseId === c.id).length;
          return (
            <Link key={c.id} to={`/course/${c.id}`} className="bg-card border border-border rounded-xl p-4 flex gap-3 hover:shadow-md transition-shadow">
              {c.thumbnailUrl && <img src={c.thumbnailUrl} alt="" className="w-24 aspect-video object-cover rounded-md" />}
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold truncate">{c.title}</div>
                <div className="text-xs text-muted-foreground">{done} of {c.lessonCount} lessons</div>
                <Bar value={(done / Math.max(c.lessonCount, 1)) * 100} className="h-1.5 mt-2" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function SearchResults({ q, courses }: { q: string; courses: CatalogCourse[] }) {
  const { data: skills = [] } = useSkills();
  const s = q.toLowerCase();
  const matches = courses.filter((c) => [c.title, c.skillName, c.creatorName, c.field].some((v) => v?.toLowerCase().includes(s)));
  const unbuilt = skills.filter((k) => !k.courseId && k.name.toLowerCase().includes(s)).slice(0, 12);
  const exact = skills.some((k) => k.name.toLowerCase() === s) || courses.some((c) => c.skillName?.toLowerCase() === s);
  return (
    <section className="container mx-auto px-4 py-8 space-y-8">
      {!exact && (
        <div className="rounded-2xl border border-dashed border-primary/40 bg-accent/50 p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <Sparkles className="h-8 w-8 text-primary shrink-0" />
          <div className="flex-1">
            <div className="font-display text-xl font-bold">Build a course for “{q}”</div>
            <div className="text-sm text-muted-foreground">We'll find the clearest teachers on YouTube and order lessons from zero to master. Takes about a minute.</div>
          </div>
          <Button asChild size="lg"><Link to={`/build?skill=${encodeURIComponent(q)}`}>Build course <ArrowRight className="h-4 w-4 ml-1" /></Link></Button>
        </div>
      )}
      {unbuilt.length > 0 && (
        <div>
          <h2 className="font-bold mb-3">Skills ready to build</h2>
          <div className="flex flex-wrap gap-2">
            {unbuilt.map((k) => (
              <Link key={k.id} to={`/build?skill=${encodeURIComponent(k.name)}`} className="text-sm border border-border bg-card rounded-full px-3 py-1.5 hover:border-primary hover:text-primary transition-colors">
                <Sparkles className="h-3 w-3 inline mr-1" />{k.name}
              </Link>
            ))}
          </div>
        </div>
      )}
      <div>
        <h2 className="font-bold mb-3">{matches.length} course{matches.length === 1 ? '' : 's'}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
          {matches.map((c) => <CourseCard key={c.id} c={c} />)}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [params] = useSearchParams();
  const q = params.get('q')?.trim() ?? '';
  const { data: courses, isLoading } = useCatalog();
  const [field, setField] = useState('All');
  const fields = useMemo(() => ['All', ...new Set((courses ?? []).map((c) => c.field).filter(Boolean) as string[])], [courses]);
  const shown = (courses ?? []).filter((c) => field === 'All' || c.field === field);

  if (q) return <SearchResults q={q} courses={courses ?? []} />;
  return (
    <>
      <Hero />
      {courses && <ContinueLearning courses={courses} />}
      <section className="container mx-auto px-4 pt-6"><div className="max-w-md"><TodayGoalBanner /></div></section>
      <FieldGrid />
      <section className="container mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-4">Ready-to-start courses</h2>
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {fields.map((f) => (
            <button key={f} onClick={() => setField(f)} className={cn('text-sm px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors', f === field ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent')}>{f}</button>
          ))}
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-video rounded-xl" />)}</div>
        ) : shown.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No courses yet. <Link to="/explore" className="text-primary underline">Pick a skill to build the first one.</Link></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">{shown.map((c) => <CourseCard key={c.id} c={c} />)}</div>
        )}
      </section>
    </>
  );
}
