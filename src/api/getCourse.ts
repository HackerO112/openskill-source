import { z } from 'zod';
import { createEndpoint, ZiteError } from 'zitejs/backend';
import { zite } from 'zitejs/db';

export default createEndpoint({
  description: 'Gets one course with its ordered lessons',
  inputSchema: z.object({ courseId: z.string() }),
  outputSchema: z.object({ course: z.any(), lessons: z.array(z.any()) }),
  execute: async ({ input }) => {
    const { rows } = await zite.sql({
      query: `SELECT c."id", c."title", c."description", c."creatorName", c."creatorChannelUrl", c."thumbnailUrl",
        c."buildStatus", s."name" AS "skillName", s."field", s."subArea"
        FROM "Courses" c LEFT JOIN "CoursesSkills" cs ON cs."coursesId" = c."id"
        LEFT JOIN "Skills" s ON s."id" = cs."skillsId" WHERE c."id" = $1 LIMIT 1`,
      params: [input.courseId],
    });
    if (!rows[0]) throw new ZiteError({ code: 'NOT_FOUND', message: 'Course not found', userFacingMessage: 'Course not found' });
    const lessons = await zite.sql({
      query: `SELECT l."id", l."title", l."level", l."order", l."youTubeVideoId", l."durationMinutes",
        l."summary", l."channelName", l."viewCount"
        FROM "Lessons" l JOIN "CoursesLessons" cl ON cl."lessonsId" = l."id"
        WHERE cl."coursesId" = $1 ORDER BY l."order" ASC`,
      params: [input.courseId],
    });
    return {
      course: rows[0] as {
        id: string; title: string; description: string | null; creatorName: string | null;
        creatorChannelUrl: string | null; thumbnailUrl: string | null; buildStatus: string;
        skillName: string | null; field: string | null; subArea: string | null;
      },
      lessons: lessons.rows as {
        id: string; title: string; level: string; order: number; youTubeVideoId: string;
        durationMinutes: number; summary: string | null; channelName: string | null; viewCount: number | null;
      }[],
    };
  },
});
