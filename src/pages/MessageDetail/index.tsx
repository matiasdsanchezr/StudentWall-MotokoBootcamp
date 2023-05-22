import { Fragment, useEffect, useState } from 'react';
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
import { Dialog, Transition } from '@headlessui/react';
import EditModal from './EditModal';
import { useQueryClient } from '@tanstack/react-query';

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
    if (votesQuery.data == null) return;
    setVote(votesQuery.data.get(BigInt(messageId ?? 0)));
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

  function onClickDelete(): void {
    setShowConfirmDialog(true);
  }

  function onClickDeleteConfirm(): void {
    if (messageId == null) return;
    setShowConfirmDialog(false);
    deleteMessageMutation.mutate(BigInt(messageId), {
      onSuccess: () => {
        setShowConfirmDialog(true);
        void queryClient.invalidateQueries({ queryKey: ['userVotes'] });
        void queryClient.invalidateQueries({ queryKey: ['messages'] });
        navigate('/messages');
      },
    });
  }

  function onClickEdit(): void {
    setShowEditModal(true);
  }

  if (
    messageQuery.isFetching ||
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
            // maxLength={200}
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
            {studentProfileQuery.data?.team != null || 'No team registered'}
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
          <button className="btn-primary" onClick={onClickEdit}>
            Edit message
          </button>
          <button className="btn-primary" onClick={onClickDelete}>
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
      {/* Confirmation dialog */}
      <Transition appear show={showConfirmDialog} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[1000]"
          onClose={() => {
            setShowConfirmDialog(false);
          }}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Delete message
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this message?.
                      <br />
                      Deleted messages cannot be recovered.
                    </p>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={onClickDeleteConfirm}
                    >
                      Confirm
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default MessagesDetail;
