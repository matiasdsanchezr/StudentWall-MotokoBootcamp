import React, { useState } from 'react';
import { AiOutlineLike, AiOutlineDislike } from 'react-icons/ai';
import {
  Message,
  Vote,
} from '../../declarations/studentWallBackend/studentWallBackend.did';
import Loader from '../../components/Loader';
import { MdOutlineExpandMore } from 'react-icons/md';
import { Link } from 'react-router-dom';
import {
  useDownVoteMutation,
  useUpVoteMutation,
} from '../../hooks/messages.hooks';

interface Props {
  message: Message;
  vote?: Vote;
}

const MessageComponent = ({ message, vote }: Props) => {
  const [isLoading, setIsLoading] = useState(false);

  const upVoteMutation = useUpVoteMutation();
  const downVoteMutation = useDownVoteMutation();

  async function onClickUpvote() {
    if (vote != null && 'Upvote' in vote) return;
    if (message.id === undefined) return;

    setIsLoading(true);
    upVoteMutation.mutate(message.id, {
      onSuccess: async () => {
        setIsLoading(false);
      },
    });
  }

  async function onClickDownvote() {
    if (vote != null && 'Downvote' in vote) return;
    if (message.id === undefined) return;

    setIsLoading(true);
    downVoteMutation.mutate(message.id, {
      onSuccess: async () => {
        setIsLoading(false);
      },
    });
  }

  return (
    <div className="relative flex flex-col rounded-2xl bg-white p-6 pb-3 text-sm text-gray-500 w-full h-[350px] sm:w-[500px] border border-gray-200 shadow">
      <div className="relative mb-2 w-[250] flex-grow overflow-hidden font-bold tracking-tight  dark:text-white">
        <p className="after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-0 after:h-16 after:bg-gradient-to-b after:from-transparent after:to-white after:to-65%">
          {'Text' in message.content
            ? message.content.Text
            : 'Non textual content'}
        </p>
      </div>
      <div>
        <p className="block font-bold text-ellipsis overflow-hidden text-gray-700 dark:text-gray-400">
          Creator:{' '}
          <span className="font-normal">{message.creator.toString()}</span>
        </p>
      </div>
      <div className="flex w-full justify-between items-center mt-auto">
        <p className="font-semibold align-middle text-gray-800 dark:text-gray-400">
          Total votes: {Number(message.vote)}
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
      <div className="flex justify-center">
        <Link
          to={`/messages/${message.id}`}
          className="cursor-pointer grid justify-items-center"
        >
          <p className="">Read more</p>
          <MdOutlineExpandMore />
        </Link>
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
  );
};

export default MessageComponent;
