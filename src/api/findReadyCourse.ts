import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';

export default createEndpoint({
  description: 'Returns the ready course id for a skill name, if one exists',
  inputSchema: z.object({ skillName: z.string().min(1).max(80) }),
  outputSchema: z.object({ courseId: z.string().nullable() }),
  execute: async ({ input }) => {
    const { rows } = await zite.sql({
      query: `SELECT c."id" FROM "Courses" c
        JOIN "CoursesSkills" cs ON cs."coursesId" = c."id"
        JOIN "Skills" s ON s."id" = cs."skillsId"
        WHERE lower(s."name") = lower($1) AND c."buildStatus" = 'Ready'
        ORDER BY c."created" DESC LIMIT 1`,
      params: [input.skillName.trim().replace(/\s+/g, ' ')],
    });
    return { courseId: (rows[0]?.id as string) ?? null };
  },
});
