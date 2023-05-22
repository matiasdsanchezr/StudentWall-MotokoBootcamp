import React, { useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  useDownVoteMutation,
  useGetMessage,
  useGetStudentProfile,
  useGetVotes,
  useUpVoteMutation,
} from '../../hooks/messages.hooks';
import { AiOutlineDislike, AiOutlineLike } from 'react-icons/ai';
import { MdOutlineExpandMore } from 'react-icons/md';
import Loader from '../../components/Loader';
import { Vote } from '../../declarations/studentWallBackend/studentWallBackend.did';

const MessagesDetail = () => {
  let { messageId } = useParams();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [vote, setVote] = useState<Vote>();

  const messageQuery = useGetMessage(BigInt(messageId ?? 0));
  const creatorPrincipal = messageQuery?.data?.creator;
  const studentProfileQuery = useGetStudentProfile(creatorPrincipal);
  const upVoteMutation = useUpVoteMutation();
  const downVoteMutation = useDownVoteMutation();
  const votesQuery = useGetVotes({
    onSuccess: (e) => {
      setVote(e.get(BigInt(messageId ?? 0)));
      setIsLoading(false);
    },
  });

  async function onClickUpvote() {
    if (!vote || !messageQuery.data) return;
    if ('Upvote' in vote) return;

    setIsLoading(true);
    upVoteMutation.mutate(BigInt(messageId ?? 0), {
      onSuccess: async () => {
        queryClient.invalidateQueries({ queryKey: ['messages'] });
        queryClient.invalidateQueries({ queryKey: ['messagesRanked'] });
      },
    });
  }

  async function onClickDownvote() {
    if (!vote || !messageQuery.data) return;
    if ('Downvote' in vote) return;

    setIsLoading(true);
    downVoteMutation.mutate(BigInt(messageId ?? 0), {
      onSuccess: async () => {
        queryClient.invalidateQueries({ queryKey: ['messages'] });
        queryClient.invalidateQueries({ queryKey: ['messagesRanked'] });
      },
    });
  }

  if (
    messageQuery.isLoading ||
    studentProfileQuery.isLoading ||
    votesQuery.isLoading
  ) {
    return (
      <div className="grid items-center h-full">
        <h1 className="text-3xl sm:text-6xl text-center">
          Loading messages...
        </h1>
      </div>
    );
  }

  if (messageQuery.error || !messageQuery.data || studentProfileQuery.error) {
    return (
      <div className="grid items-center h-full">
        <h1 className="text-3xl sm:text-6xl text-center">
          Error while fetching information
        </h1>
      </div>
    );
  }

  return (
    // <div className="w-full min-h-full flex flex-col justify-center items-center p-2">
    //   <div className="flex flex-col max-w-5xl text-center gap-3">
    //     <h2 className="text-5xl">Message Detail</h2>
    //     <div className="rounded-xl p-2 shadow shadow-gray-300 bg-gray-100">
    //       <p className="text-md">
    //         {'Text' in messageQuery.data.content
    //           ? messageQuery.data.content.Text
    //           : 'Invalid message ID'}
    //       </p>
    //       <p>{studentProfileQuery.data?.name}</p>
    //     </div>
    //     <div className="grid gap-3 justify-center p-2 rounded-xl shadow shadow-gray-300 bg-gray-100 w-min">
    //       <h3 className="font-bold text-2xl">Creator Profile</h3>
    //       <div className="">
    //         <span className="font-semibold">Name: </span>
    //         <span> {studentProfileQuery.data?.name}</span>
    //       </div>
    //       <div className="">
    //         <span className="font-semibold">Email: </span>
    //         <span> {studentProfileQuery.data?.email}</span>
    //       </div>
    //       <div className="">
    //         <span className="font-semibold">Team: </span>
    //         <span>
    //           {' '}
    //           {studentProfileQuery.data?.team || 'No team registered'}
    //         </span>
    //       </div>
    //       <div className="">
    //         <span className="font-semibold">Graduate: </span>
    //         <span>{studentProfileQuery.data?.graduate ? 'Yes' : 'No'}</span>
    //       </div>
    //     </div>
    //     <div></div>
    //   </div>
    // </div>
    <div className="w-full min-h-full flex flex-col gap-3 justify-center items-center p-2">
      <div className="relative flex flex-col rounded-2xl bg-white p-6 pb-3 text-sm text-gray-500 w-full sm:max-w-6xl border border-gray-200 shadow">
        <div className="relative mb-2 w-[250] flex-grow overflow-hidden font-bold tracking-tight  dark:text-white">
          <p>
            {'Text' in messageQuery.data.content
              ? messageQuery.data.content.Text
              : 'Non textual content'}
          </p>
        </div>
        <div>
          <p className="block font-bold text-ellipsis overflow-hidden text-gray-700 dark:text-gray-400">
            Creator ID:{' '}
            <span className="font-normal">
              {messageQuery.data.creator.toString()}
            </span>
          </p>
        </div>
        <div className="flex w-full justify-between items-center mt-auto">
          <p className="font-semibold align-middle text-gray-800 dark:text-gray-400">
            Total votes: {Number(messageQuery.data.vote)}
          </p>
          <div className="flex gap-2">
            <button onClick={onClickUpvote} disabled={isLoading}>
              <AiOutlineLike
                className={`text-4xl rounded-full p-1 bg-black/10 ${
                  vote != null && 'Upvote' in vote && 'bg-green-300'
                }`}
              />
            </button>
            <button onClick={onClickDownvote} disabled={isLoading}>
              <AiOutlineDislike
                className={`text-4xl rounded-full p-1 bg-black/10 ${
                  vote != null && 'Downvote' in vote && 'bg-red-300'
                }`}
              />
            </button>
          </div>
        </div>
        {/* Loading animation */}
        {isLoading && (
          <div className="fixed z-[1000] top-0 left-0 w-screen h-screen bg-black/30 grid justify-center content-center justify-items-center">
            <p className="block text-white text-5xl text-center mb-10">
              Changing vote
            </p>
            <Loader className="block" />
          </div>
        )}
      </div>
      <div className="grid gap-3 justify-center p-2 rounded-xl bg-white w-full sm:max-w-xl border border-gray-200 shadow">
        <h3 className="font-bold text-2xl">Creator Profile</h3>
        <div className="">
          <span className="font-semibold">Name: </span>
          <span> {studentProfileQuery.data?.name}</span>
        </div>
        <div className="">
          <span className="font-semibold">Email: </span>
          <span> {studentProfileQuery.data?.email}</span>
        </div>
        <div className="">
          <span className="font-semibold">Team: </span>
          <span> {studentProfileQuery.data?.team || 'No team registered'}</span>
        </div>
        <div className="">
          <span className="font-semibold">Graduate: </span>
          <span>{studentProfileQuery.data?.graduate ? 'Yes' : 'No'}</span>
        </div>
      </div>
    </div>
  );
};

export default MessagesDetail;
