import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';

export default createEndpoint({
  description: 'Lists the full skills directory with each skill\'s course status',
  inputSchema: z.object({}),
  outputSchema: z.object({ skills: z.array(z.any()) }),
  execute: async () => {
    const { rows } = await zite.sql({
      query: `SELECT s."id", s."name", s."field", s."subArea", s."popularity",
        (SELECT c."id" FROM "CoursesSkills" cs JOIN "Courses" c ON c."id" = cs."coursesId"
          WHERE cs."skillsId" = s."id" AND c."buildStatus" = 'Ready' LIMIT 1) AS "courseId",
        (SELECT COUNT(*) FROM "CoursesSkills" cs JOIN "Courses" c ON c."id" = cs."coursesId"
          JOIN "CoursesLessons" cl ON cl."coursesId" = c."id"
          WHERE cs."skillsId" = s."id" AND c."buildStatus" = 'Ready')::int AS "lessonCount"
        FROM "Skills" s WHERE s."name" IS NOT NULL
        ORDER BY s."popularity" DESC NULLS LAST, s."name" ASC LIMIT 2000`,
    });
    return {
      skills: rows as {
        id: string; name: string; field: string | null; subArea: string | null;
        popularity: number | null; courseId: string | null; lessonCount: number;
      }[],
    };
  },
});
