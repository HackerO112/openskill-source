import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';

export default createEndpoint({
  description: 'Lists every ready course with its skill, field, and lesson stats',
  inputSchema: z.object({}),
  outputSchema: z.object({ courses: z.array(z.any()) }),
  execute: async () => {
    const { rows } = await zite.sql({
      query: `SELECT c."id", c."title", c."description", c."creatorName", c."thumbnailUrl", c."created",
        s."id" AS "skillId", s."name" AS "skillName", s."field", s."subArea", s."popularity",
        (SELECT COUNT(*) FROM "CoursesLessons" cl WHERE cl."coursesId" = c."id")::int AS "lessonCount",
        (SELECT COALESCE(SUM(l."durationMinutes"),0) FROM "CoursesLessons" cl JOIN "Lessons" l ON l."id" = cl."lessonsId" WHERE cl."coursesId" = c."id")::float AS "totalMinutes"
        FROM "Courses" c
        LEFT JOIN "CoursesSkills" cs ON cs."coursesId" = c."id"
        LEFT JOIN "Skills" s ON s."id" = cs."skillsId"
        WHERE c."buildStatus" = 'Ready' AND c."published" = true
        ORDER BY s."popularity" DESC NULLS LAST, c."created" DESC LIMIT 2000`,
    });
    return {
      courses: rows as {
        id: string; title: string; description: string | null; creatorName: string | null;
        thumbnailUrl: string | null; created: string; skillId: string | null; skillName: string | null;
        field: string | null; subArea: string | null; popularity: number | null;
        lessonCount: number; totalMinutes: number;
      }[],
    };
  },
});
