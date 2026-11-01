import {
  Code2, Brain, PenTool, Palette, Music, Film, Camera, Feather, Briefcase, Megaphone, PiggyBank,
  Languages, FlaskConical, GraduationCap, Dumbbell, ChefHat, Scissors, Sprout, Wrench, Mountain,
  Sparkles, Gamepad2, type LucideIcon,
} from 'lucide-react';

export const FIELD_META: Record<string, { icon: LucideIcon; hue: number }> = {
  'Programming & Tech': { icon: Code2, hue: 158 },
  'Data & AI': { icon: Brain, hue: 200 },
  Design: { icon: PenTool, hue: 280 },
  'Art & Drawing': { icon: Palette, hue: 330 },
  Music: { icon: Music, hue: 12 },
  'Video & Film': { icon: Film, hue: 0 },
  Photography: { icon: Camera, hue: 220 },
  Writing: { icon: Feather, hue: 30 },
  Business: { icon: Briefcase, hue: 210 },
  Marketing: { icon: Megaphone, hue: 20 },
  'Finance & Investing': { icon: PiggyBank, hue: 140 },
  Languages: { icon: Languages, hue: 250 },
  'Science & Math': { icon: FlaskConical, hue: 190 },
  'Academics & Exams': { icon: GraduationCap, hue: 230 },
  'Health & Fitness': { icon: Dumbbell, hue: 350 },
  Cooking: { icon: ChefHat, hue: 38 },
  'Crafts & DIY': { icon: Scissors, hue: 300 },
  'Home & Garden': { icon: Sprout, hue: 110 },
  'Trades & Mechanics': { icon: Wrench, hue: 25 },
  'Sports & Outdoors': { icon: Mountain, hue: 170 },
  'Personal Development': { icon: Sparkles, hue: 45 },
  'Hobbies & Lifestyle': { icon: Gamepad2, hue: 265 },
};

export const fieldMeta = (f?: string | null) => FIELD_META[f ?? ''] ?? { icon: Sparkles, hue: 158 };
