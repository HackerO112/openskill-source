import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { BookCheck, Clock, Download, Flame, Trophy, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@project/components/ui/button';
import { Progress as Bar } from '@project/components/ui/progress';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@project/components/ui/alert-dialog';
import { useCatalog } from '../lib/data';
import { progress, streak, useProgress } from '../lib/progress';
import GoalsPanel from '../components/Goals';

function Stat({ icon: Icon, label, value }: { icon: typeof Flame; label: string; value: string | number }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="h-4 w-4 text-primary" />{label}</div>
      <div className="text-3xl font-display font-extrabold mt-1">{value}</div>
    </div>
  );
}

export default function MyLearning() {
  const p = useProgress();
  const { data: courses = [] } = useCatalog();
  const fileRef = useRef<HTMLInputElement>(null);
  const completed = Object.values(p.completed);
  const hours = completed.reduce((s, c) => s + c.minutes, 0) / 60;
  const rows = Object.entries(p.last)
    .sort((a, b) => b[1].at.localeCompare(a[1].at))
    .map(([id, last]) => ({ c: courses.find((x) => x.id === id), last, done: completed.filter((x) => x.courseId === id).length }))
    .filter((r) => r.c);
  const finished = rows.filter((r) => r.c!.lessonCount > 0 && r.done >= r.c!.lessonCount).length;

  const exportFile = () => {
    const blob = new Blob([progress.export()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `openskill-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };
  const importFile = async (f?: File) => {
    if (!f) return;
    try { progress.import(await f.text()); toast.success('Progress imported'); }
    catch { toast.error('That file is not a valid OpenSkill progress file'); }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold">My Learning</h1>
      <p className="text-muted-foreground text-sm">Saved in this browser. Export it to continue on another device.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <Stat icon={Flame} label="Day streak" value={`${streak(p)} 🔥`} />
        <Stat icon={BookCheck} label="Lessons done" value={completed.length} />
        <Stat icon={Clock} label="Hours learned" value={hours.toFixed(1)} />
        <Stat icon={Trophy} label="Courses finished" value={finished} />
      </div>
      <GoalsPanel />
      <div className="mt-8 border border-border rounded-xl divide-y divide-border bg-card">
        {rows.length === 0 && <div className="p-10 text-center text-muted-foreground">Nothing started yet. <Link to="/explore" className="text-primary">Pick a skill</Link></div>}
        {rows.map(({ c, last, done }) => (
          <div key={c!.id} className="flex items-center gap-4 p-4">
            {c!.thumbnailUrl ? <img src={c!.thumbnailUrl} alt="" className="w-28 aspect-video object-cover rounded-md" /> : <div className="w-28 aspect-video bg-muted rounded-md" />}
            <div className="flex-1 min-w-0">
              <Link to={`/course/${c!.id}`} className="font-semibold hover:text-primary">{c!.title}</Link>
              <div className="text-xs text-muted-foreground">{done} of {c!.lessonCount} lessons</div>
              <Bar value={(done / Math.max(c!.lessonCount, 1)) * 100} className="h-1.5 mt-2" />
            </div>
            <Button asChild variant="outline" size="sm"><Link to={`/course/${c!.id}/lesson/${last.lessonId}`}>Resume</Link></Button>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="outline" onClick={exportFile}><Download className="h-4 w-4 mr-1" />Export progress</Button>
        <Button variant="outline" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4 mr-1" />Import progress</Button>
        <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => importFile(e.target.files?.[0])} />
        <AlertDialog>
          <AlertDialogTrigger asChild><Button variant="ghost" className="text-destructive">Reset</Button></AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset all progress?</AlertDialogTitle>
              <AlertDialogDescription>This erases completed lessons, notes, and your streak from this browser. Export first if you want a backup.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => { progress.reset(); toast.success('Progress reset'); }}>Reset</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
