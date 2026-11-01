import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Circle, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { Button } from '@project/components/ui/button';
import { buildCourse, findReadyCourse } from 'zitejs/api';
import { motion } from 'framer-motion';
import { FIELD_META } from '../lib/fields';

const STEPS = [
  'Searching YouTube videos and playlists',
  'Ranking creators by views, likes, and channel size',
  'Choosing beginner-friendly lessons and sorting into levels',
  'Saving your course',
];

export default function BuildPage() {
  const [params] = useSearchParams();
  const skill = params.get('skill') ?? '';
  const [step, setStep] = useState(0);
  const [found, setFound] = useState<string>();
  const [error, setError] = useState<string>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const started = useRef('');

  const finished = useRef(false);

  const finish = (courseId: string) => {
    if (finished.current) return;
    finished.current = true;
    qc.invalidateQueries({ queryKey: ['catalog'] });
    qc.invalidateQueries({ queryKey: ['skills'] });
    navigate(`/course/${courseId}`, { replace: true });
  };

  // Safety net: if the live progress connection stalls, check every few seconds whether the course is ready.
  useEffect(() => {
    if (!skill) return;
    const t = setInterval(async () => {
      try {
        const { courseId } = await findReadyCourse({ skillName: skill });
        if (courseId) { setStep(4); finish(courseId); }
      } catch { /* keep waiting */ }
    }, 4000);
    return () => clearInterval(t);
  }, [skill]);

  const run = async () => {
    setError(undefined); setStep(0);
    try {
      const res = buildCourse({ skillName: skill });
      let buf = '';
      for await (const chunk of res) {
        buf += chunk;
        for (const m of buf.matchAll(/\|s(\d)(?::(\d+))?\|/g)) {
          setStep((s) => Math.max(s, Number(m[1])));
          if (m[2]) setFound(m[2]);
        }
      }
      const { courseId } = await res.result;
      finish(courseId);
    } catch (e) {
      const { courseId } = await findReadyCourse({ skillName: skill }).catch(() => ({ courseId: null }));
      if (courseId) return finish(courseId);
      if (!finished.current) setError(e instanceof Error ? e.message : 'Something went wrong');
    }
  };

  useEffect(() => {
    if (skill && started.current !== skill) { started.current = skill; run(); }
  }, [skill]);

  if (!skill) return <div className="container mx-auto px-4 py-20 text-center"><Link to="/explore" className="text-primary">Pick a skill to build</Link></div>;

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center text-center">
      <div className="relative h-36 w-36">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl animate-pulse" />
        <div className="absolute inset-8 rounded-3xl bg-gradient-to-br from-primary to-[hsl(var(--highlight))] grid place-items-center shadow-xl shadow-primary/30">
          <Sparkles className="h-9 w-9 text-primary-foreground" />
        </div>
        <motion.div className="absolute inset-0" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}>
          {Object.values(FIELD_META).slice(0, 6).map(({ icon: Icon, hue }, i) => (
            <span key={i} className="absolute h-8 w-8 rounded-full grid place-items-center bg-card border border-border shadow"
              style={{ left: `${50 + 46 * Math.cos((i / 6) * 2 * Math.PI)}%`, top: `${50 + 46 * Math.sin((i / 6) * 2 * Math.PI)}%`, transform: 'translate(-50%,-50%)', color: `hsl(${hue} 65% 45%)` }}>
              <Icon className="h-4 w-4" />
            </span>
          ))}
        </motion.div>
      </div>
      <h1 className="text-3xl md:text-4xl font-extrabold mt-4">Building your course: {skill}</h1>
      <p className="text-muted-foreground mt-2">Finding the clearest teachers on YouTube and ordering lessons from zero to master.</p>
      <div className="w-full max-w-lg mt-10 border border-border rounded-xl divide-y divide-border text-left bg-card">
        {STEPS.map((label, i) => {
          const done = step > i;
          const current = step === i && !error;
          return (
            <div key={label} className="flex items-center gap-3 p-4">
              {done ? <CheckCircle2 className="h-5 w-5 text-primary" /> : current ? <Loader2 className="h-5 w-5 text-primary animate-spin" /> : <Circle className="h-5 w-5 text-muted-foreground/50" />}
              <span className={done || current ? 'text-sm' : 'text-sm text-muted-foreground'}>
                {i === 0 && found ? `Found ${found} strong candidate videos` : label}
              </span>
            </div>
          );
        })}
      </div>
      {error && (
        <div className="mt-6 max-w-lg rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-4 w-4" />{error}</div>
          <div className="flex gap-2"><Button onClick={run}>Try again</Button><Button variant="outline" asChild><Link to="/explore">Back to Explore</Link></Button></div>
        </div>
      )}
    </div>
  );
}
