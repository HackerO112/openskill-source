import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, PlayCircle, Sparkles, Youtube } from 'lucide-react';
import { Button } from '@project/components/ui/button';
import { FIELD_META } from '../lib/fields';

const FLOAT = [
  { icon: Flame, text: '7-day streak', cls: 'top-6 right-4' },
  { icon: Youtube, text: 'Top YouTube teachers', cls: 'top-1/2 -left-6' },
  { icon: PlayCircle, text: 'Lesson 13 · Functions', cls: 'bottom-6 right-10' },
];

export function Hero() {
  const icons = Object.values(FIELD_META).slice(0, 9);
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-accent via-background to-secondary">
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-[hsl(var(--highlight)/0.18)] blur-3xl" />
      <div className="container mx-auto px-4 py-14 md:py-20 grid lg:grid-cols-2 gap-10 items-center relative">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-card border border-border rounded-full px-3 py-1 mb-4 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />Free · Open · No account needed
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-[0.98]">
            Learn any skill,<br />
            <span className="bg-gradient-to-r from-primary to-[hsl(var(--highlight))] bg-clip-text text-transparent">zero to master.</span>
          </h1>
          <p className="text-lg text-muted-foreground mt-5 max-w-xl">Step-by-step courses built from the best teachers on YouTube. Track every lesson, keep a streak, and never lose your place.</p>
          <div className="flex flex-wrap gap-3 mt-7">
            <Button asChild size="lg" className="shadow-lg shadow-primary/25"><Link to="/explore">Explore 1,000+ skills</Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/my-learning">My Learning</Link></Button>
          </div>
        </motion.div>
        <div className="relative hidden lg:block h-80">
          <div className="grid grid-cols-3 gap-4 w-80 mx-auto">
            {icons.map(({ icon: Icon, hue }, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.06, type: 'spring' }}
                className="aspect-square rounded-2xl grid place-items-center shadow-sm border border-border"
                style={{ background: `hsl(${hue} 70% 50% / 0.14)`, color: `hsl(${hue} 65% 45%)` }}>
                <Icon className="h-9 w-9" />
              </motion.div>
            ))}
          </div>
          {FLOAT.map(({ icon: Icon, text, cls }, i) => (
            <motion.div key={text} className={`absolute ${cls} bg-card border border-border rounded-full px-3 py-1.5 text-xs font-semibold shadow-lg flex items-center gap-1.5`}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: [0, -6, 0] }} transition={{ delay: 0.6 + i * 0.2, y: { repeat: Infinity, duration: 3 + i, ease: 'easeInOut' } }}>
              <Icon className="h-3.5 w-3.5 text-primary" />{text}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FieldGrid() {
  return (
    <section className="container mx-auto px-4 pt-10">
      <h2 className="text-2xl font-bold mb-4">Browse by field</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {Object.entries(FIELD_META).map(([name, { icon: Icon, hue }], i) => (
          <motion.div key={name} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 6) * 0.04 }}>
            <Link to={`/explore?field=${encodeURIComponent(name)}`}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:-translate-y-0.5 hover:shadow-md transition-all">
              <span className="h-10 w-10 rounded-lg grid place-items-center shrink-0 group-hover:scale-110 transition-transform"
                style={{ background: `hsl(${hue} 70% 50% / 0.14)`, color: `hsl(${hue} 65% 45%)` }}><Icon className="h-5 w-5" /></span>
              <span className="text-sm font-semibold leading-tight">{name}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
