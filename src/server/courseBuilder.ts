import { GoogleGenerativeAI } from '@google/generative-ai';
import { integrations } from 'zitejs/integrations';
import { zite } from 'zitejs/db';

const YT = 'https://www.googleapis.com/youtube/v3';
export const FIELDS = [
  'Programming & Tech', 'Data & AI', 'Design', 'Art & Drawing', 'Music', 'Video & Film', 'Photography',
  'Writing', 'Business', 'Marketing', 'Finance & Investing', 'Languages', 'Science & Math',
  'Academics & Exams', 'Health & Fitness', 'Cooking', 'Crafts & DIY', 'Home & Garden',
  'Trades & Mechanics', 'Sports & Outdoors', 'Personal Development', 'Hobbies & Lifestyle',
];

type Candidate = {
  id: string; title: string; description: string; channelId: string; channelTitle: string;
  minutes: number; views: number; likes: number; subs: number; publishedAt: string;
  thumb: string; playlist?: string; score: number;
};

async function yt(path: string, params: Record<string, string>) {
  const qs = new URLSearchParams({ ...params, key: process.env.ZITE_YOUTUBE_API_KEY });
  const res = await fetch(`${YT}/${path}?${qs}`);
  if (!res.ok) throw new Error(`YouTube ${path} failed (${res.status}): ${(await res.text()).slice(0, 300)}`);
  return res.json() as Promise<any>;
}

function isoMinutes(d: string) {
  const m = d.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return Number(m[1] || 0) * 60 + Number(m[2] || 0) + Number(m[3] || 0) / 60;
}

const chunk = <T,>(a: T[], n: number) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n));

export async function gatherCandidates(skill: string) {
  const [vids, lists] = await Promise.all([
    yt('search', { part: 'snippet', type: 'video', q: `learn ${skill} tutorial`, maxResults: '50', relevanceLanguage: 'en', videoEmbeddable: 'true', safeSearch: 'strict' }),
    yt('search', { part: 'snippet', type: 'playlist', q: `${skill} full course beginner to advanced`, maxResults: '10', relevanceLanguage: 'en' }),
  ]);
  const playlistOf = new Map<string, string>();
  const ids = new Set<string>(vids.items.map((i: any) => i.id.videoId).filter(Boolean));
  const topLists = lists.items.slice(0, 3);
  const listItems = await Promise.all(topLists.map((l: any) =>
    yt('playlistItems', { part: 'contentDetails', playlistId: l.id.playlistId, maxResults: '50' }).catch(() => ({ items: [] }))));
  listItems.forEach((res: any, i: number) => res.items.forEach((it: any) => {
    const vid = it.contentDetails.videoId;
    ids.add(vid);
    if (!playlistOf.has(vid)) playlistOf.set(vid, `${topLists[i].snippet.title} (#${playlistOf.size + 1})`);
  }));

  const details = (await Promise.all(chunk([...ids], 50).map((c) =>
    yt('videos', { part: 'snippet,statistics,contentDetails,status', id: c.join(',') })))).flatMap((r: any) => r.items);
  const channelIds = [...new Set(details.map((d: any) => d.snippet.channelId))] as string[];
  const subs = new Map<string, number>();
  (await Promise.all(chunk(channelIds, 50).map((c) => yt('channels', { part: 'statistics', id: c.join(',') }))))
    .flatMap((r: any) => r.items).forEach((c: any) => subs.set(c.id, Number(c.statistics.subscriberCount || 0)));

  const out: Candidate[] = [];
  for (const d of details) {
    if (d.status?.embeddable === false) continue;
    const minutes = isoMinutes(d.contentDetails.duration);
    if (minutes < 3 || minutes > 300) continue;
    const views = Number(d.statistics.viewCount || 0);
    const likes = Number(d.statistics.likeCount || 0);
    const s = subs.get(d.snippet.channelId) || 0;
    const ageYears = (Date.now() - new Date(d.snippet.publishedAt).getTime()) / 3.15e10;
    const score = Math.log10(views + 1) * 2 + Math.min(likes / Math.max(views, 1), 0.08) * 40
      + Math.log10(s + 1) - Math.min(ageYears, 10) * 0.15 + (playlistOf.has(d.id) ? 1 : 0);
    out.push({
      id: d.id, title: d.snippet.title, description: (d.snippet.description || '').slice(0, 160),
      channelId: d.snippet.channelId, channelTitle: d.snippet.channelTitle, minutes, views, likes, subs: s,
      publishedAt: d.snippet.publishedAt, thumb: d.snippet.thumbnails?.high?.url || d.snippet.thumbnails?.medium?.url || '',
      playlist: playlistOf.get(d.id), score,
    });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, 70);
}

type Plan = {
  title: string; description: string; field: string;
  lessons: { videoId: string; title: string; level: string; summary: string }[];
};

export async function planCourse(skill: string, cands: Candidate[]): Promise<Plan> {
  const { accessToken } = await integrations.get('gemini');
  const ai = new GoogleGenerativeAI(accessToken);
  const model = {
    async generateContent(prompt: string) {
      let last: unknown;
      const attempts: [string, number][] = [
        ['gemini-3.5-flash-lite', 45_000], ['gemini-3.8-flash', 60_000], ['gemini-3.5-flash-lite', 45_000],
      ];
      for (const [name, timeout] of attempts) {
        try {
          return await ai.getGenerativeModel(
            { model: name, generationConfig: { responseMimeType: 'application/json' } },
            { timeout },
          ).generateContent(prompt);
        } catch (e) {
          last = e;
          await new Promise((r) => setTimeout(r, 1500));
        }
      }
      throw last;
    },
  };
  const list = cands.map((c) => ({
    videoId: c.id, title: c.title, channel: c.channelTitle, minutes: Math.round(c.minutes),
    views: c.views, subscribers: c.subs, playlist: c.playlist, description: c.description,
  }));
  const prompt = `You are designing a free "zero to master" course for the skill "${skill}" using only the YouTube videos below.
Pick 15 to 40 videos that are the clearest, most beginner-friendly, well-explained lessons from respected creators (prefer creators who teach this for a living, high views and subscribers). Avoid duplicates covering the same topic, clickbait, reaction videos, shorts, news, and off-topic videos. Prefer keeping consecutive videos from one good playlist/creator when it gives a coherent path.
Order them as a learning path from absolute zero to mastery, assigning each a level: "Beginner", "Intermediate", "Advanced", or "Master" (non-decreasing order).
For each lesson write a short clean lesson title (no channel names, no emojis, no "#1") and a one-sentence summary of what the learner gets.
Also return a course title like "${skill}: Zero to Master", a 2-sentence description, and "field" chosen from: ${FIELDS.join(', ')}.
Return JSON: {"title":string,"description":string,"field":string,"lessons":[{"videoId":string,"title":string,"level":string,"summary":string}]}

Videos:
${JSON.stringify(list)}`;
  const res = await model.generateContent(prompt);
  const plan = JSON.parse(res.response.text()) as Plan;
  const valid = new Set(cands.map((c) => c.id));
  const seen = new Set<string>();
  plan.lessons = (plan.lessons || []).filter((l) => valid.has(l.videoId) && !seen.has(l.videoId) && seen.add(l.videoId));
  if (plan.lessons.length < 5) throw new Error('Not enough good videos found for this skill.');
  return plan;
}

export async function findOrCreateSkill(name: string, addedBy: 'Directory' | 'Learner Search') {
  const clean = name.trim().replace(/\s+/g, ' ');
  const { rows } = await zite.sql({
    query: 'SELECT "id" FROM "Skills" WHERE lower("name") = lower($1) LIMIT 1',
    params: [clean],
  });
  if (rows[0]) return rows[0].id as string;
  const rec = await zite.skills.create({
    record: { name: clean, field: null, subArea: null, popularity: 0, addedBy, courses: null },
  });
  return rec.id;
}

export async function existingCourse(skillId: string) {
  const { rows } = await zite.sql({
    query: `SELECT c."id", c."buildStatus", c."created" FROM "Courses" c
      JOIN "CoursesSkills" cs ON cs."coursesId" = c."id" WHERE cs."skillsId" = $1
      ORDER BY c."created" DESC LIMIT 1`,
    params: [skillId],
  });
  return rows[0] as { id: string; buildStatus: string; created: string } | undefined;
}

/** Builds a course for a skill. onStep reports progress 1..4. Returns the course id. */
export async function buildCourseForSkill(skillId: string, onStep: (n: number, info?: string) => Promise<void> | void) {
  const skill = await zite.skills.findOne({ id: skillId });
  if (!skill?.name) throw new Error('Skill not found');
  const prev = await existingCourse(skillId);
  if (prev?.buildStatus === 'Ready') return prev.id;
  if (prev?.buildStatus === 'Building' && Date.now() - new Date(prev.created).getTime() < 4 * 60_000) {
    throw new Error('This course is being built right now. Please try again in a minute.');
  }
  if (prev) await zite.courses.delete({ id: prev.id });

  const course = await zite.courses.create({
    record: {
      title: `${skill.name}: Zero to Master`, skill: skillId, description: null, creatorName: null,
      creatorChannelUrl: null, thumbnailUrl: null, published: false, source: 'Auto-generated',
      buildStatus: 'Building', lessons: null,
    },
  });
  try {
    const cands = await gatherCandidates(skill.name);
    await onStep(1, `${cands.length}`);
    if (cands.length < 5) throw new Error('Not enough good videos found for this skill.');
    await onStep(2);
    const plan = await planCourse(skill.name, cands);
    await onStep(3);
    const byId = new Map(cands.map((c) => [c.id, c]));
    const counts = new Map<string, number>();
    plan.lessons.forEach((l) => { const c = byId.get(l.videoId)!; counts.set(c.channelId, (counts.get(c.channelId) || 0) + 1); });
    const topChannel = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
    const top = cands.find((c) => c.channelId === topChannel)!;
    const levels = ['Beginner', 'Intermediate', 'Advanced', 'Master'];
    const lessons = plan.lessons.map((l, i) => {
      const c = byId.get(l.videoId)!;
      return {
        title: l.title || c.title, course: course.id, level: levels.includes(l.level) ? l.level : 'Beginner',
        order: i + 1, youTubeVideoId: c.id, durationMinutes: Math.round(c.minutes * 10) / 10,
        summary: l.summary || null, channelName: c.channelTitle, viewCount: c.views,
      };
    });
    for (const batch of chunk(lessons, 100)) await zite.lessons.bulkCreate({ records: batch });
    const firstThumb = byId.get(plan.lessons[0].videoId)!.thumb;
    await zite.courses.update({
      id: course.id,
      record: {
        title: plan.title || course.title!, description: plan.description || null,
        creatorName: counts.size > 1 ? `${top.channelTitle} + ${counts.size - 1} more` : top.channelTitle,
        creatorChannelUrl: `https://www.youtube.com/channel/${topChannel}`, thumbnailUrl: firstThumb,
        published: true, buildStatus: 'Ready',
      } as any,
    });
    if (!skill.field && FIELDS.includes(plan.field)) {
      await zite.skills.update({ id: skillId, record: { field: plan.field } as any });
    }
    await onStep(4);
    return course.id;
  } catch (e) {
    await zite.courses.update({ id: course.id, record: { buildStatus: 'Failed' } as any });
    throw e;
  }
}
