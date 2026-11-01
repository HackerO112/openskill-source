import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { buildCourseForSkill } from '../server/courseBuilder';

export default createEndpoint({
  description: 'Builds courses for the most popular skills that do not have one yet (run daily)',
  inputSchema: z.object({ count: z.number().min(1).max(10).default(5) }),
  outputSchema: z.object({ built: z.array(z.string()), failed: z.array(z.string()) }),
  execute: async ({ input }) => {
    const { rows } = await zite.sql({
      query: `SELECT s."id", s."name" FROM "Skills" s
        WHERE NOT EXISTS (SELECT 1 FROM "CoursesSkills" cs JOIN "Courses" c ON c."id" = cs."coursesId"
          WHERE cs."skillsId" = s."id" AND c."buildStatus" = 'Ready')
        ORDER BY s."popularity" DESC NULLS LAST LIMIT $1`,
      params: [input.count ?? 5],
    });
    const built: string[] = [];
    const failed: string[] = [];
    await Promise.all(rows.map(async (r) => {
      try { await buildCourseForSkill(r.id as string, () => {}); built.push(r.name as string); }
      catch { failed.push(r.name as string); }
    }));
    return { built, failed };
  },
});
