import { useEffect, useRef } from 'react';
import { Bell, Target } from 'lucide-react';
import { toast } from 'sonner';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from 'recharts';
import { Button } from '@project/components/ui/button';
import { cn } from '@project/components/lib/utils';
import { minutesByDay, progress, todayMinutes, useProgress } from '../lib/progress';

const GOALS = [10, 20, 30, 60];

export function GoalRing({ size = 72 }: { size?: number }) {
  const p = useProgress();
  const goal = p.goalMinutes ?? 20;
  const today = todayMinutes(p);
  const pct = Math.min(today / goal, 1);
  const r = size / 2 - 6;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90 shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={6} className="fill-none stroke-muted" />
      <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={6} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
        className="fill-none stroke-primary transition-all duration-700" />
    </svg>
  );
}

/** Compact banner for the home page. */
export function TodayGoalBanner() {
  const p = useProgress();
  const goal = p.goalMinutes ?? 20;
  const today = todayMinutes(p);
  const left = Math.max(goal - today, 0);
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
      <GoalRing size={56} />
      <div className="flex-1">
        <div className="font-semibold text-sm">{left === 0 ? 'Daily goal reached! 🎉' : `${left} min left to hit today's goal`}</div>
        <div className="text-xs text-muted-foreground">{today} of {goal} minutes learned today</div>
      </div>
    </div>
  );
}

/** Reminds the learner while the site is open if they haven't hit today's goal yet. */
export function GoalReminder() {
  const p = useProgress();
  const shown = useRef(false);
  useEffect(() => {
    const goal = p.goalMinutes ?? 20;
    if (shown.current || todayMinutes(p) >= goal || Object.keys(p.completed).length === 0) return;
    shown.current = true;
    const msg = `You have ${goal - todayMinutes(p)} min left on today's goal. Keep your streak going!`;
    toast(msg, { icon: '🎯' });
    if ('Notification' in window && Notification.permission === 'granted' && document.hidden) new Notification('OpenSkill', { body: msg });
  }, [p]);
  return null;
}

export default function GoalsPanel() {
  const p = useProgress();
  const goal = p.goalMinutes ?? 20;
  const data = minutesByDay(p, 7);
  const week = data.reduce((s, d) => s + d.minutes, 0);
  const hit = data.filter((d) => d.minutes >= goal).length;
  const enableNotif = async () => {
    if (!('Notification' in window)) return toast.error('This browser does not support notifications');
    const res = await Notification.requestPermission();
    res === 'granted' ? toast.success('Reminders on while OpenSkill is open in a tab') : toast.error('Notifications were blocked');
  };
  return (
    <div className="grid lg:grid-cols-3 gap-4 mt-6">
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 text-sm font-semibold"><Target className="h-4 w-4 text-primary" />Daily goal</div>
        <div className="flex items-center gap-4 mt-3">
          <GoalRing size={84} />
          <div><div className="text-3xl font-display font-extrabold">{todayMinutes(p)}<span className="text-base text-muted-foreground font-sans">/{goal}m</span></div><div className="text-xs text-muted-foreground">today</div></div>
        </div>
        <div className="flex gap-2 mt-4">
          {GOALS.map((g) => (
            <button key={g} onClick={() => progress.setGoal(g)} className={cn('text-xs px-3 py-1.5 rounded-full', g === goal ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground')}>{g}m</button>
          ))}
        </div>
        <Button variant="outline" size="sm" className="mt-3 w-full" onClick={enableNotif}><Bell className="h-4 w-4 mr-1" />Turn on reminders</Button>
      </div>
      <div className="bg-card border border-border rounded-xl p-5 lg:col-span-2">
        <div className="flex justify-between text-sm"><span className="font-semibold">This week</span><span className="text-muted-foreground">{week} min · goal hit {hit}/7 days</span></div>
        <div className="h-48 mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} width={30} />
              <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} formatter={(v) => [`${v} min`, 'Learned']} />
              <ReferenceLine y={goal} stroke="hsl(var(--chart-2))" strokeDasharray="4 4" />
              <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
