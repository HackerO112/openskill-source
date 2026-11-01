import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fieldMeta } from '../lib/fields';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { Input } from '@project/components/ui/input';
import { Skeleton } from '@project/components/ui/skeleton';
import { cn } from '@project/components/lib/utils';
import { useSkills, type Skill } from '../lib/data';

function SkillTile({ k }: { k: Skill }) {
  const to = k.courseId ? `/course/${k.courseId}` : `/build?skill=${encodeURIComponent(k.name)}`;
  return (
    <Link to={to} className="border border-border bg-card rounded-xl p-3 hover:border-primary hover:shadow-sm transition-all">
      <div className="text-sm font-semibold">{k.name}</div>
      <div className={cn('text-xs mt-0.5 flex items-center gap-1', k.courseId ? 'text-primary' : 'text-muted-foreground')}>
        {k.courseId ? <><CheckCircle2 className="h-3 w-3" />Course ready · {k.lessonCount} lessons</> : <><Sparkles className="h-3 w-3" />Builds on first open</>}
      </div>
    </Link>
  );
}

export default function Explore() {
  const { data: skills, isLoading } = useSkills();
  const [params] = useSearchParams();
  const [field, setField] = useState<string | null>(params.get('field'));
  const [sub, setSub] = useState('All');
  const [filter, setFilter] = useState('');
  const byField = useMemo(() => {
    const m = new Map<string, Skill[]>();
    (skills ?? []).forEach((k) => { const f = k.field ?? 'Other'; m.set(f, [...(m.get(f) ?? []), k]); });
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [skills]);
  const active = field ?? byField[0]?.[0];
  const list = byField.find(([f]) => f === active)?.[1] ?? [];
  const subs = ['All', ...new Set(list.map((k) => k.subArea).filter(Boolean) as string[])];
  const f = filter.toLowerCase();
  const shown = filter
    ? (skills ?? []).filter((k) => k.name.toLowerCase().includes(f))
    : list.filter((k) => sub === 'All' || k.subArea === sub);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold">Explore every skill</h1>
          <p className="text-muted-foreground">{skills?.length ?? '…'} skills across {byField.length} fields. Every one can be learned here.</p>
        </div>
        <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter skills…" className="md:w-72" />
      </div>
      {isLoading ? <Skeleton className="h-96 w-full" /> : (
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="md:w-60 shrink-0 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
            {byField.map(([name, ks]) => (
              <button key={name} onClick={() => { setField(name); setSub('All'); setFilter(''); }}
                className={cn('text-left text-sm px-3 py-2 rounded-lg whitespace-nowrap flex justify-between gap-3', name === active && !filter ? 'bg-accent text-accent-foreground font-semibold' : 'text-muted-foreground hover:bg-secondary')}>
                <span className="flex items-center gap-2">{(() => { const { icon: I, hue } = fieldMeta(name); return <I className="h-4 w-4" style={{ color: `hsl(${hue} 60% 38%)` }} />; })()}{name}</span><span className="opacity-60">{ks.length}</span>
              </button>
            ))}
          </aside>
          <div className="flex-1 min-w-0">
            {!filter && <h2 className="text-2xl font-bold">{active}</h2>}
            {!filter && subs.length > 1 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {subs.map((s) => (
                  <button key={s} onClick={() => setSub(s)} className={cn('text-xs px-3 py-1 rounded-full', s === sub ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground')}>{s}</button>
                ))}
              </div>
            )}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-4">
              {shown.map((k) => <SkillTile key={k.id} k={k} />)}
            </div>
            {filter && shown.length === 0 && (
              <Link to={`/build?skill=${encodeURIComponent(filter)}`} className="inline-flex items-center gap-2 mt-4 text-primary font-semibold">
                <Sparkles className="h-4 w-4" />Build a course for “{filter}”
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
