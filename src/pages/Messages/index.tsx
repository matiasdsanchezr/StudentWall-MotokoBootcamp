import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { type Vote } from '../../declarations/studentWallBackend/studentWallBackend.did';
import MessageCard from './MessageCard';
import ResponsivePagination from 'react-responsive-pagination';
import 'react-responsive-pagination/themes/classic.css';
import Loader from '../../components/Loader';
import {
  useGetPagesCount,
  useGetPaginatedMessages,
  useGetPaginatedMessagesRanked,
  useGetVotes,
} from '../../hooks/messages.hooks';
import NewMessageModal from './NewMessageModal';

function classNames(...classes: any): string {
  return classes.filter(Boolean).join(' ');
}

export default function Messages(): JSX.Element {
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [messagesPage, setMessagesPage] = useState(1);
  const [messagesRankedPage, setMessagesRankedPage] = useState(1);

  const pageCountQuery = useGetPagesCount();
  const recentsQuery = useGetPaginatedMessages(messagesPage);
  const rankedQuery = useGetPaginatedMessagesRanked(messagesRankedPage);
  const userVotesQuery = useGetVotes();

  function getMessageVote(messageId: bigint): Vote | undefined {
    if (userVotesQuery.data == null)
      throw new Error('Error while fetching user votes');
    const vote = userVotesQuery.data.get(messageId);
    return vote;
  }

  if (
    recentsQuery.isLoading ||
    userVotesQuery.isLoading ||
    rankedQuery.isLoading
  ) {
    return (
      <div className="grid items-center h-full">
        <h1 className="text-3xl sm:text-6xl text-center">
          Loading messages...
        </h1>
      </div>
    );
  }

  if (recentsQuery.isError || userVotesQuery.isError || rankedQuery.isError) {
    return (
      <div className="grid justify-center ">
        <h1 className="text-3xl sm:text-6xl text-center">
          Error while loading
        </h1>
      </div>
    );
  }

  const categories = {
    Recent: {
      data: recentsQuery.data,
      currentPage: messagesPage,
      setPage: setMessagesPage,
    },
    Popular: {
      data: rankedQuery.data,
      currentPage: messagesRankedPage,
      setPage: setMessagesRankedPage,
    },
  };

  return (
    <div className="w-full min-h-full">
      <Tab.Group
        as="div"
        className="w-full grid content-center justify-center items-center justify-items-center min-h-full px-1 sm:px-10"
      >
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
        <Tab.Panels className="mt-2 bg-black/5 rounded-xl p-1 md:p-5">
          {Object.values(categories).map((category, index) => (
            <Tab.Panel key={index}>
              <div className="flex flex-wrap gap-3 justify-center rounded-xl">
                {category.data?.map(function (x) {
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
                  current={category.currentPage}
                  total={Number(pageCountQuery.data)}
                  onPageChange={(page) => {
                    category.setPage(page);
                  }}
                />
              </div>
            </Tab.Panel>
          ))}
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
      <NewMessageModal
        showModal={showNewMessageModal}
        setShowModal={setShowNewMessageModal}
      />
      {/* Loader */}
      {(recentsQuery.isFetching || rankedQuery.isFetching) && (
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
