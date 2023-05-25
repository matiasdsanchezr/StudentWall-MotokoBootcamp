import { useState } from 'react';
import { AiOutlineLike, AiOutlineDislike } from 'react-icons/ai';
import {
  type Message,
  type Vote,
} from '../../declarations/studentWallBackend/studentWallBackend.did';
import Loader from '../../components/Loader';
import { Link } from 'react-router-dom';
import {
  useDownVoteMutation,
  useUpVoteMutation,
} from '../../hooks/messages.hooks';
import { useQueryClient } from '@tanstack/react-query';

interface Props {
  message: Message;
  vote?: Vote;
}

const MessageComponent = ({ message, vote }: Props): JSX.Element => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const upVoteMutation = useUpVoteMutation();
  const downVoteMutation = useDownVoteMutation();

  function onClickUpvote(): void {
    if (vote != null && 'Upvote' in vote) return;
    if (message.id === undefined) return;

    setIsLoading(true);
    upVoteMutation.mutate(message.id, {
      onSuccess: () => {
        setIsLoading(false);
        void queryClient.invalidateQueries({ queryKey: ['userVotes'] });
        void queryClient.invalidateQueries({ queryKey: ['messages'] });
      },
    });
  }

  function onClickDownvote(): void {
    if (vote != null && 'Downvote' in vote) return;
    if (message.id === undefined) return;

    setIsLoading(true);
    downVoteMutation.mutate(message.id, {
      onSuccess: () => {
        setIsLoading(false);
        void queryClient.invalidateQueries({ queryKey: ['userVotes'] });
        void queryClient.invalidateQueries({ queryKey: ['messages'] });
      },
    });
  }

  return (
    <div className="relative flex flex-col min-h-96 rounded-2xl bg-white p-6 pb-3 text-sm text-gray-500 w-full sm:w-[500px] border border-gray-200 shadow">
      <div className="relative mb-2w-[250]  flex-grow overflow-hidden font-bold tracking-tight">
        <p className="line-clamp-6">
          {'Text' in message.content
            ? message.content.Text
            : 'Non textual content'}
        </p>
      </div>
      <div className="justify-center py-3 border-b-2 border-gray-300">
        <Link
          to={`/messages/${message.id}`}
          className="cursor-pointer flex gap-1 justify-center align-middle items-center content-center justify-items-center"
        >
          <p className="inline text-md font-medium hover:text-blue-600">
            More details
          </p>
          {/* <AiOutlinePlusCircle className="inline text-lg" /> */}
        </Link>
      </div>
      <div className="mt-3">
        <p className="block font-bold text-ellipsis overflow-hidden text-gray-700">
          Creator:{' '}
          <span className="font-normal">{message.creator.toString()}</span>
        </p>
      </div>
      <div className="flex w-full justify-between items-center mt-auto">
        <p className="font-semibold align-middle text-gray-800">
          Total votes: {Number(message.vote)}
        </p>
        <div className="flex gap-2">
          <button onClick={onClickUpvote} disabled={isLoading}>
            <AiOutlineLike
              className={`text-4xl rounded-full p-1 bg-black/10 ${
                vote != null && 'Upvote' in vote ? 'bg-green-300' : ''
              }`}
            />
          </button>
          <button onClick={onClickDownvote} disabled={isLoading}>
            <AiOutlineDislike
              className={`text-4xl rounded-full p-1 bg-black/10 ${
                vote != null && 'Downvote' in vote ? 'bg-red-300' : ''
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
  );
};

export default MessageComponent;
