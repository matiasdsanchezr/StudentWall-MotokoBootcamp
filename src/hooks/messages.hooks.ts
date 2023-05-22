/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useAuth } from '../contexts/AuthContext';
import {
  type Content,
  type Vote,
} from '../declarations/studentWallBackend/studentWallBackend.did';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Principal } from '@dfinity/principal';

interface useGetVotesProps {
  onSuccess?: (data: Map<bigint, Vote>) => void;
}
/** Get all the votes from the authenticated student. */
export function useGetVotes(options?: useGetVotesProps) {
  const { backendActor } = useAuth();

  const fetchUserVotes = async () => {
    const votes = await backendActor?.getStudentVotes();
    return new Map<bigint, Vote>(votes?.map((kv) => [kv[0], kv[1]]));
  };

  return useQuery({
    queryKey: ['userVotes'],
    queryFn: fetchUserVotes,
    onSuccess: options?.onSuccess,
    staleTime: 10 * (60 * 1000),
    cacheTime: 15 * (60 * 1000),
  });
}

/** Get a message by id. */
export function useGetMessage(messageId: bigint) {
  const { backendActor } = useAuth();

  const fetchMessage = async () => {
    const response = await backendActor?.getMessage(messageId);
    if (response == null || 'err' in response)
      return await Promise.reject(
        response?.err ?? 'Error while fetching message',
      );
    return response.ok;
  };

  return useQuery({
    queryKey: ['messages', 'messageDetail'],
    queryFn: fetchMessage,
  });
}

/** Get the pages count of messages. */
export function useGetPagesCount() {
  const { backendActor } = useAuth();

  const fetchMessagePagesCount = async () =>
    await backendActor?.getMessagesPageCount();

  return useQuery({
    queryKey: ['messagesCount'],
    queryFn: async () => await fetchMessagePagesCount(),
    staleTime: 60 * 1000,
    cacheTime: 90 * 1000,
  });
}

/** Get paginated messages ordered by date. Returns 10 messages per page. */
export function useGetPaginatedMessages(page: number) {
  const { backendActor } = useAuth();

  const fetchMessages = async (page = 1) => {
    return await backendActor?.getPaginatedMessages(BigInt(page));
  };

  return useQuery({
    queryKey: ['messages', 'recents', page],
    queryFn: async () => await fetchMessages(page),
    keepPreviousData: true,
    staleTime: 60 * 1000,
    cacheTime: 90 * 1000,
  });
}

/** Get paginated messages ordered by votes. Returns 10 messages per page. */
export function useGetPaginatedMessagesRanked(page: number) {
  const { backendActor } = useAuth();

  const fetchMessagesRanked = async (page = 1) => {
    return await backendActor?.getPaginatedMessagesRanked(BigInt(page));
  };

  return useQuery({
    queryKey: ['messages', 'ranked', page],
    queryFn: async () => await fetchMessagesRanked(page),
    keepPreviousData: true,
    staleTime: 60 * 1000,
    cacheTime: 90 * 1000,
  });
}

/** Get a student's profile using a Principal */
export function useGetStudentProfile(principal: Principal | null) {
  const { backendActor } = useAuth();

  const fetchStudentProfile = async () => {
    const response = await backendActor?.seeAProfile(
      principal ?? Principal.anonymous(),
    );
    return response == null || 'err' in response
      ? await Promise.reject(response?.err)
      : response.ok;
  };

  return useQuery({
    queryKey: ['users', principal],
    queryFn: fetchStudentProfile,
    enabled: principal != null,
    staleTime: 60 * 1000,
    cacheTime: 90 * 1000,
  });
}

/** Save a new message */
export function useWriteMessageMutation() {
  const { backendActor } = useAuth();

  const writeMessage = async (content: Content) => {
    return backendActor != null
      ? await backendActor.writeMessage(content)
      : await Promise.reject(new Error('User not authenticated'));
  };

  return useMutation({
    mutationFn: writeMessage,
  });
}

/** Update the content of a message */
export function useUpdateMessageMutation() {
  const { backendActor } = useAuth();

  interface Props {
    messageId: bigint;
    content: Content;
  }

  const updateMessage = async ({ messageId, content }: Props) => {
    return backendActor != null
      ? await backendActor.updateMessage(messageId, content)
      : await Promise.reject(new Error('User not authenticated'));
  };

  return useMutation({
    mutationFn: updateMessage,
  });
}

/** Upvote a message by id */
export function useDeleteMessage() {
  const { backendActor } = useAuth();

  const deleteMessage = async (messageId: bigint) => {
    const response = await backendActor?.deleteMessage(messageId);
    return response == null || 'err' in response
      ? await Promise.reject(response?.err ?? 'Error while upvoting message')
      : response.ok;
  };

  return useMutation({
    mutationFn: deleteMessage,
  });
}

/** Upvote a message by id */
export function useUpVoteMutation() {
  const { backendActor } = useAuth();

  const upVote = async (messageId: bigint) => {
    const response = await backendActor?.upVote(messageId);
    return response == null || 'err' in response
      ? await Promise.reject(response?.err ?? 'Error while upvoting message')
      : response.ok;
  };

  return useMutation({
    mutationFn: upVote,
  });
}

/** Downvote a message by id */
export function useDownVoteMutation() {
  const { backendActor } = useAuth();

  const downVote = async (messageId: bigint) => {
    const response = await backendActor?.downVote(messageId);
    return response == null || 'err' in response
      ? await Promise.reject(response?.err ?? 'Error while upvoting message')
      : response.ok;
  };

  return useMutation({
    mutationFn: downVote,
  });
}
