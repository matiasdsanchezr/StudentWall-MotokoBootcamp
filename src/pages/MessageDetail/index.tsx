import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useDeleteMessage,
  useDownVoteMutation,
  useGetMessage,
  useGetStudentProfile,
  useGetVotes,
  useUpVoteMutation,
} from '../../hooks/messages.hooks';
import { AiOutlineDislike, AiOutlineLike } from 'react-icons/ai';
import Loader from '../../components/Loader';
import { type Vote } from '../../declarations/studentWallBackend/studentWallBackend.did';
import { useAuth } from '../../contexts/AuthContext';
import EditModal from './EditModal';
import { useQueryClient } from '@tanstack/react-query';
import ConfirmDialog from './ConfirmDialog';

const MessagesDetail = (): JSX.Element => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { messageId } = useParams();
  const { principal } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [vote, setVote] = useState<Vote>();

  const messageQuery = useGetMessage(BigInt(messageId ?? 0));
  const creatorPrincipal = messageQuery?.data?.creator;
  const studentProfileQuery = useGetStudentProfile(creatorPrincipal ?? null);
  const upVoteMutation = useUpVoteMutation();
  const downVoteMutation = useDownVoteMutation();
  const deleteMessageMutation = useDeleteMessage();
  const votesQuery = useGetVotes();

  useEffect(() => {
    if (votesQuery.data == null || messageId == null) return;
    setVote(votesQuery.data.get(BigInt(messageId)));
    setIsLoading(false);
  }, [votesQuery.data]);

  function onClickUpvote(): void {
    if (vote != null && 'Upvote' in vote) return;
    if (messageId == null) return;
    setIsLoading(true);
    upVoteMutation.mutate(BigInt(messageId), {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ['userVotes'] });
        void queryClient.invalidateQueries({ queryKey: ['messages'] });
      },
    });
  }

  function onClickDownvote(): void {
    if (vote != null && 'Downvote' in vote) return;
    if (messageId == null) return;
    setIsLoading(true);
    downVoteMutation.mutate(BigInt(messageId), {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ['userVotes'] });
        void queryClient.invalidateQueries({ queryKey: ['messages'] });
      },
    });
  }

  function onClickDeleteConfirm(): void {
    if (messageId == null) return;
    setIsLoading(true);
    setShowConfirmDialog(false);
    deleteMessageMutation.mutate(BigInt(messageId), {
      onSuccess: () => {
        setShowConfirmDialog(true);
        void queryClient.invalidateQueries({ queryKey: ['userVotes'] });
        void queryClient.invalidateQueries({ queryKey: ['messages'] });
        setIsLoading(false);
        navigate('/messages');
      },
    });
  }

  if (
    messageQuery.isFetching ||
    studentProfileQuery.isLoading ||
    votesQuery.isLoading
  ) {
    return (
      <div className="grid items-center justify-center h-full">
        <h1 className="text-3xl sm:text-6xl w=min">
          <Loader className="border-t-gray-400" />
        </h1>
      </div>
    );
  }

  if (
    messageQuery.isError ||
    messageQuery.data == null ||
    studentProfileQuery.isError
  ) {
    return (
      <div className="grid items-center h-full">
        <h1 className="text-3xl sm:text-6xl text-center">
          Error while fetching information. Message not found.
        </h1>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full flex flex-col gap-3 justify-center items-center p-2">
      <h2 className="text-4xl">Message detail</h2>
      <div className="relative flex flex-col rounded-2xl bg-white p-2 sm:p-6 pb-3 text-sm text-gray-500 w-full sm:max-w-6xl border border-gray-200 shadow">
        <div className="relative mb-2 w-full min-h-[500px] flex flex-grow font-bold active:ring-transparent ">
          <textarea
            className="flex-grow resize-none block focus:border-none focus:outline-none"
            readOnly={true}
            maxLength={5000}
            value={
              'Text' in messageQuery.data.content
                ? messageQuery.data.content.Text
                : 'Non textual content'
            }
          />
        </div>
        <div>
          <p className="block font-bold text-ellipsis overflow-hidden text-gray-700">
            Creator ID:{' '}
            <span className="font-normal">
              {messageQuery.data.creator.toString()}
            </span>
          </p>
        </div>
        <div className="flex w-full justify-between items-center mt-auto">
          <p className="font-semibold align-middle text-gray-800">
            Total votes: {Number(messageQuery.data.vote)}
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
      </div>
      <div className="grid gap-3 justify-center p-2 rounded-xl bg-white w-full sm:max-w-xl border border-gray-200 shadow">
        <h3 className="font-bold text-2xl">Creator Profile</h3>
        <div className="overflow-ellipsis overflow-hidden">
          <span className="font-semibold">Name: </span>
          <span className="">{studentProfileQuery.data?.name}</span>
        </div>
        <div className="overflow-ellipsis overflow-hidden">
          <span className="font-semibold">Email: </span>
          <span> {studentProfileQuery.data?.email}</span>
        </div>
        <div className="overflow-ellipsis overflow-hidden">
          <span className="font-semibold">Team: </span>
          <span>
            {' '}
            {studentProfileQuery.data?.team != null
              ? studentProfileQuery.data?.team
              : 'No team registered'}
          </span>
        </div>
        <div className="overflow-ellipsis overflow-hidden">
          <span className="font-semibold">Graduate: </span>
          <span>{studentProfileQuery.data?.graduate ? 'Yes' : 'No'}</span>
        </div>
      </div>
      {/* Edit and Delete buttons section */}
      {principal != null && creatorPrincipal?.compareTo(principal) === 'eq' && (
        <div className="flex gap-5">
          <button
            className="btn-primary"
            onClick={() => {
              setShowEditModal(true);
            }}
          >
            Edit message
          </button>
          <button
            className="btn-primary bg-red-400 hover:bg-red-500"
            onClick={() => {
              setShowConfirmDialog(true);
            }}
          >
            Delete
          </button>
        </div>
      )}
      {/* Loading animation */}
      {isLoading && (
        <div className="fixed z-[1000] top-0 left-0 w-screen h-screen bg-black/30 grid justify-center content-center justify-items-center">
          <p className="block text-white text-5xl text-center mb-10">
            Loading message
          </p>
          <Loader className="block" />
        </div>
      )}
      <EditModal
        showModal={showEditModal}
        setShowModal={setShowEditModal}
        message={messageQuery.data}
      />
      <ConfirmDialog
        showConfirmDialog={showConfirmDialog}
        setShowConfirmDialog={setShowConfirmDialog}
        onClickConfirm={onClickDeleteConfirm}
      />
    </div>
  );
};

export default MessagesDetail;
