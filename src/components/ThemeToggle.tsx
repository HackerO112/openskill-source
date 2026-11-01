import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@project/components/ui/button';

const KEY = 'openskill-theme';

export function initTheme() {
  if (localStorage.getItem(KEY) === 'dark') document.documentElement.classList.add('dark');
}

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem(KEY, dark ? 'dark' : 'light');
  }, [dark]);
  return (
    <Button variant="ghost" size="icon" className="rounded-full" aria-label="Toggle dark mode" onClick={() => setDark((d) => !d)}>
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
