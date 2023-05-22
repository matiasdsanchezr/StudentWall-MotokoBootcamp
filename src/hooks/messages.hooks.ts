import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Content,
  Vote,
} from '../declarations/studentWallBackend/studentWallBackend.did';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Principal } from '@dfinity/principal';

type useGetVotesProps = {
  onSuccess?: (data: Map<bigint, Vote>) => void;
};
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
    if (!response || 'err' in response)
      return Promise.reject(response?.err ?? 'Error while fetching message');
    return response.ok;
  };

  return useQuery({
    queryKey: ['messageDetail'],
    queryFn: fetchMessage,
    staleTime: 60 * 1000,
    cacheTime: 90 * 1000,
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
    queryKey: ['messages', page],
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
    queryKey: ['messagesRanked', page],
    queryFn: async () => await fetchMessagesRanked(page),
    keepPreviousData: true,
    staleTime: 60 * 1000,
    cacheTime: 90 * 1000,
  });
}

/** Get a student's profile using a Principal */
export function useGetStudentProfile(principal: Principal | undefined) {
  const { backendActor } = useAuth();

  const fetchStudentProfile = async () => {
    if (!principal) return Promise.reject();
    const response = await backendActor?.seeAProfile(principal);
    return !response || 'err' in response
      ? Promise.reject(response?.err)
      : response.ok;
  };

  return useQuery({
    queryKey: ['user', principal],
    queryFn: fetchStudentProfile,
    enabled: !!principal,
    staleTime: 60 * 1000,
    cacheTime: 90 * 1000,
  });
}

/** Save a new message */
export function useWriteMessageMutation() {
  const queryClient = useQueryClient();
  const { backendActor } = useAuth();

  const writeMessageMutation = async (content: Content) => {
    return backendActor != null
      ? await backendActor.writeMessage(content)
      : await Promise.reject(new Error('User not authenticated'));
  };

  return useMutation({
    mutationFn: writeMessageMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['messagesRanked'] });
    },
  });
}

/** Upvote a message by id */
export function useUpVoteMutation() {
  const queryClient = useQueryClient();
  const { backendActor } = useAuth();

  const upVote = async (messageId: bigint) => {
    const response = await backendActor?.upVote(messageId);
    return !response || 'err' in response
      ? Promise.reject(response?.err ?? 'Error while upvoting message')
      : response.ok;
  };

  return useMutation({
    mutationFn: upVote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userVotes'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['messagesRanked'] });
    },
  });
}

/** Downvote a message by id */
export function useDownVoteMutation() {
  const queryClient = useQueryClient();
  const { backendActor } = useAuth();

  const downVote = async (messageId: bigint) => {
    const response = await backendActor?.downVote(messageId);
    return !response || 'err' in response
      ? Promise.reject(response?.err ?? 'Error while upvoting message')
      : response.ok;
  };

  return useMutation({
    mutationFn: downVote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userVotes'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['messagesRanked'] });
    },
  });
}
