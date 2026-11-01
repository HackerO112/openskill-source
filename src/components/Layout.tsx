import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import { GraduationCap, Search } from 'lucide-react';
import { cn } from '@project/components/lib/utils';
import { GoalReminder } from './Goals';
import ThemeToggle, { initTheme } from './ThemeToggle';

initTheme();

function SearchBox() {
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const navigate = useNavigate();
  useEffect(() => setQ(params.get('q') ?? ''), [params]);
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); navigate(q.trim() ? `/?q=${encodeURIComponent(q.trim())}` : '/'); }}
      className="flex items-center gap-2 bg-card border border-border rounded-full px-4 h-10 w-full max-w-md focus-within:ring-2 focus-within:ring-ring/40"
    >
      <Search className="h-4 w-4 text-muted-foreground shrink-0" />
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); navigate(e.target.value ? `/?q=${encodeURIComponent(e.target.value)}` : '/', { replace: true }); }}
        placeholder="Search any skill: Python, watercolor, welding…"
        className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground"
      />
    </form>
  );
}

const nav = ({ isActive }: { isActive: boolean }) =>
  cn('text-sm font-medium px-3 py-2 rounded-full transition-colors', isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground');

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="h-8 w-8 rounded-lg bg-primary text-primary-foreground grid place-items-center"><GraduationCap className="h-5 w-5" /></span>
            <span className="font-display font-bold text-lg hidden sm:block">OpenSkill</span>
          </Link>
          <div className="flex-1 flex justify-center"><SearchBox /></div>
          <nav className="flex items-center gap-1 shrink-0">
            <NavLink to="/explore" className={nav}>Explore</NavLink>
            <NavLink to="/my-learning" className={nav}>My Learning</NavLink>
            <NavLink to="/source" className={nav}>Source</NavLink>
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main className="flex-1"><Outlet /></main>
      <GoalReminder />
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        OpenSkill is free and open. Every lesson is a YouTube video by its original creator.
      </footer>
    </div>
  );
}
