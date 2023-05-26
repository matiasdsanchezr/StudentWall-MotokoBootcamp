/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { type Homework } from '../declarations/studentWallBackend/studentWallBackend.did';

/** Get all the votes from the authenticated student. */
export function useGetHomeworkDiary() {
  const { backendActor } = useAuth();

  const fetchHomeworkDiary = async () => {
    const res = await backendActor?.getAllHomework();
    return res;
  };

  return useQuery({
    queryKey: ['homeworks'],
    queryFn: fetchHomeworkDiary,
    staleTime: 10 * (60 * 1000),
    cacheTime: 15 * (60 * 1000),
  });
}

export function useAddHomework() {
  const { backendActor } = useAuth();

  const addHomework = async (homework: Homework) => {
    const res = await backendActor?.addHomework(homework);
    return res;
  };

  return useMutation({
    mutationFn: addHomework,
  });
}

export function useDeleteHomework() {
  const { backendActor } = useAuth();

  const deleteHomework = async (homeworkId: bigint) => {
    const res = await backendActor?.deleteHomework(homeworkId);
    return res;
  };

  return useMutation({
    mutationFn: deleteHomework,
  });
}

export function useToggleCompleted() {
  const { backendActor } = useAuth();

  const toggleCompleted = async (homeworkId: bigint) => {
    const res = await backendActor?.toggleCompleted(homeworkId);
    return res;
  };

  return useMutation({
    mutationFn: toggleCompleted,
  });
}
