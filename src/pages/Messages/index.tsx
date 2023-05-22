import { Fragment, useState } from 'react';
import { Dialog, Tab, Transition } from '@headlessui/react';
import {
  type Content,
  type Vote,
} from '../../declarations/studentWallBackend/studentWallBackend.did';
import MessageCard from './MessageCard';
import ResponsivePagination from 'react-responsive-pagination';
import 'react-responsive-pagination/themes/classic.css';
import Loader from '../../components/Loader';
import {
  useGetPagesCount,
  useGetPaginatedMessages,
  useGetPaginatedMessagesRanked,
  useGetVotes,
  useWriteMessageMutation,
} from '../../hooks/messages.hooks';
import { useQueryClient } from '@tanstack/react-query';

function classNames(...classes: any): string {
  return classes.filter(Boolean).join(' ');
}

export default function Messages(): JSX.Element {
  const queryClient = useQueryClient();

  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [messagesPage, setMessagesPage] = useState(1);
  const [messagesRankedPage, setMessagesRankedPage] = useState(1);
  const [messageTextArea, setMessageTextArea] = useState('');
  const [isMutating, setIsMutating] = useState(false);

  const [categories] = useState({
    Recent: null,
    Popular: null,
  });

  const messagePagesCountQuery = useGetPagesCount();
  const messagesQuery = useGetPaginatedMessages(messagesPage);
  const messagesRankedQuery = useGetPaginatedMessagesRanked(messagesRankedPage);
  const votesQuery = useGetVotes();
  const writeMessageMutation = useWriteMessageMutation();

  function getMessageVote(messageId: bigint): Vote | undefined {
    if (votesQuery.data == null)
      throw new Error('Error while fetching user votes');
    const vote = votesQuery.data.get(messageId);
    return vote;
  }

  function onChangeTextArea(e: React.ChangeEvent<HTMLTextAreaElement>): void {
    setMessageTextArea(e.target.value);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    setIsMutating(true);
    const content: Content = { Text: messageTextArea };
    writeMessageMutation.mutate(content, {
      onSuccess: () => {
        setIsMutating(false);
        setShowNewMessageModal(false);
        setMessageTextArea('');
        void queryClient.invalidateQueries({ queryKey: ['messages'] });
        void queryClient.invalidateQueries({ queryKey: ['messagesCount'] });
      },
    });
  }

  if (messagesQuery.isLoading || votesQuery.isLoading) {
    return (
      <div className="grid items-center h-full">
        <h1 className="text-3xl sm:text-6xl text-center">
          Loading messages...
        </h1>
      </div>
    );
  }

  if (messagesQuery.isError || votesQuery.isError) {
    return (
      <div className="grid justify-center ">
        <h1 className="text-3xl sm:text-6xl text-center">
          Error while loading
        </h1>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full">
      <Tab.Group as="div" className="w-full h-full px-1 sm:px-10">
        <Tab.List className="m-auto flex justify-center rounded-xl bg-blue-900/20 p-1 w-full max-w-[800px]">
          {Object.keys(categories).map((category) => (
            <Tab
              key={category}
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white shadow'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white',
                )
              }
            >
              {category}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-2 bg-black/5 rounded-xl p-1 md:p-5 min-h-full">
          <Tab.Panel key={0}>
            <div className="flex flex-wrap gap-3 justify-center rounded-xl min-h-[1000px]">
              {messagesQuery.data?.map(function (x) {
                return (
                  <MessageCard
                    key={Number(x.id)}
                    message={x}
                    vote={getMessageVote(x.id)}
                  />
                );
              })}
            </div>
            <div className="my-5 sm:my-2">
              <ResponsivePagination
                current={messagesPage}
                total={Number(messagePagesCountQuery.data)}
                onPageChange={(page) => {

                  setMessagesPage(page);
                }}
              />
            </div>
          </Tab.Panel>
          <Tab.Panel key={1}>
            <div className="flex flex-wrap gap-3 justify-center rounded-xl min-h-[1000px]">
              {messagesRankedQuery.data?.map(function (x) {
                return (
                  <MessageCard
                    key={Number(x.id)}
                    message={x}
                    vote={getMessageVote(x.id)}
                  />
                );
              })}
            </div>
            <div className="my-5 sm:my-2">
              <ResponsivePagination
                current={messagesRankedPage}
                total={Number(messagePagesCountQuery.data)}
                onPageChange={(page) => {
    
                  setMessagesRankedPage(page);
                }}
              />
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
      <div className="w-full text-center my-5">
        <button
          className="btn-primary"
          onClick={() => {
            setShowNewMessageModal(true);
          }}
        >
          Write message
        </button>
      </div>
      {/* Write new message modal */}
      <Transition appear show={showNewMessageModal} as={Fragment}>
        <Dialog
          as="div"
          onClose={() => {
            setShowNewMessageModal(false);
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
          <div className="fixed inset-2 z-[100]">
            <div className="flex h-full items-center justify-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="flex flex-col z-50 min-h-[60%] w-full max-w-4xl transform rounded-2xl bg-white p-2 sm:p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 m-1 sm:m-3 text-gray-900"
                  >
                    Write a new message
                  </Dialog.Title>
                  <form className="flex-grow flex flex-col" onSubmit={onSubmit}>
                    <textarea
                      id="story"
                      className="p-2 bg-black/10 rounded-xl w-full flex-grow mb-4 resize-none border-2 border-gray-300"
                      placeholder="Write a message with a minimum of 10 characters..."
                      required={true}
                      onChange={onChangeTextArea}
                    ></textarea>
                    <div className="ml-auto">
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={messageTextArea.length < 10 || isMutating}
                      >
                        Publish
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      {(messagesQuery.isFetching || messagesRankedQuery.isFetching) && (
        <div className="fixed z-[1000] inset-0 bg-black/30 grid justify-center content-center justify-items-center">
          <p className="block text-white text-5xl text-center mb-10">
            Loading messages
          </p>
          <Loader className="block" />
        </div>
      )}
    </div>
  );
}
