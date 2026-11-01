import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { buildCourseForSkill, existingCourse, findOrCreateSkill } from '../server/courseBuilder';

export default createEndpoint({
  description: 'Builds (or reuses) a zero-to-master course for a skill, streaming progress steps',
  stream: true,
  inputSchema: z.object({ skillName: z.string().min(1).max(80) }),
  outputSchema: z.object({ courseId: z.string() }),
  execute: async ({ input, stream }) => {
    const skillId = await findOrCreateSkill(input.skillName, 'Learner Search');
    const prev = await existingCourse(skillId);
    if (prev?.buildStatus === 'Ready') {
      await stream.write('|s4|');
      return { courseId: prev.id };
    }
    const courseId = await buildCourseForSkill(skillId, async (n, info) => {
      await stream.write(`|s${n}${info ? `:${info}` : ''}|`);
    });
    return { courseId };
  },
});
