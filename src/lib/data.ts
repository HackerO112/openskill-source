import { useQuery } from '@tanstack/react-query';
import { getCatalog, getSkills, getCourse } from 'zitejs/api';

export const useCatalog = () =>
  useQuery({ queryKey: ['catalog'], queryFn: async () => (await getCatalog({})).courses, staleTime: 60_000 });

export const useSkills = () =>
  useQuery({ queryKey: ['skills'], queryFn: async () => (await getSkills({})).skills, staleTime: 60_000 });

export const useCourse = (courseId: string) =>
  useQuery({ queryKey: ['course', courseId], queryFn: () => getCourse({ courseId }), enabled: !!courseId });

export type CatalogCourse = NonNullable<ReturnType<typeof useCatalog>['data']>[number];
export type Skill = NonNullable<ReturnType<typeof useSkills>['data']>[number];
