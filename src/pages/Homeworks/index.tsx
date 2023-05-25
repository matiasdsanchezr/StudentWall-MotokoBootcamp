import { Tab } from '@headlessui/react';
import { useState } from 'react';
import { useGetHomeworkDiary } from '../../hooks/homeworkDiary.hooks';
import HomeworkCard from './HomeworkCard';
import AddHomeworkModal from './AddHomeworkModal';
import Loader from '../../components/Loader';

function classNames(...classes: any): string {
  return classes.filter(Boolean).join(' ');
}

const Homeworks = (): JSX.Element => {
  const [categories] = useState({
    All: null,
    Pending: null,
  });
  const [showAddHomeworkModal, setShowAddHomeworkModal] = useState(false);

  const homeworkDiaryQuery = useGetHomeworkDiary();

  if (homeworkDiaryQuery.isLoading)
    return (
      <div className="grid items-center h-full">
        <h1 className="text-3xl sm:text-6xl text-center">
          Loading homework list...
        </h1>
      </div>
    );

  if (homeworkDiaryQuery.isError) return <div className=""></div>;

  return (
    <div className="grid">
      {' '}
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
            <div className="grid-rows-1 gap-3 rounded-xl min-h-[1000px]">
              {homeworkDiaryQuery.data?.map(([key, homework]) => (
                <HomeworkCard
                  key={key.toString()}
                  homeworkId={key}
                  homework={homework}
                />
              ))}
            </div>
          </Tab.Panel>
          <Tab.Panel key={1}>
            <div className="grid gap-3 justify-center rounded-xl min-h-[1000px]">
              {homeworkDiaryQuery.data?.map(([key, homework]) => (
                <HomeworkCard
                  key={key.toString()}
                  homeworkId={key}
                  homework={homework}
                />
              ))}
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
      <button
        className="btn-primary m-auto"
        onClick={() => {
          setShowAddHomeworkModal(true);
        }}
      >
        Add homework
      </button>
      <AddHomeworkModal
        showModal={showAddHomeworkModal}
        setShowModal={setShowAddHomeworkModal}
      />
      {/* <EditHomeworkModal show/> */}
      {/* Loader */}
      {homeworkDiaryQuery.isFetching && (
        <div className="fixed z-[1000] inset-0 bg-black/30 grid justify-center content-center justify-items-center">
          <p className="block text-white text-5xl text-center mb-10">
            Loading messages
          </p>
          <Loader className="block" />
        </div>
      )}
    </div>
  );
};

export default Homeworks;
