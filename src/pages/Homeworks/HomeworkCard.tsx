import { Disclosure } from '@headlessui/react';
import { type Homework } from '../../declarations/studentWallBackend/studentWallBackend.did';
import { FaCheckCircle } from 'react-icons/fa';
import { MdPendingActions } from 'react-icons/md';
import { RiCheckboxLine, RiCheckboxIndeterminateLine } from 'react-icons/ri';
import { HiOutlineTrash } from 'react-icons/hi';
import { AiOutlineEdit } from 'react-icons/ai';
import {
  useDeleteHomework,
  useToggleCompleted,
} from '../../hooks/homeworkDiary.hooks';
import type React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import Loader from '../../components/Loader';

interface Props {
  homework: Homework;
  homeworkId: bigint;
}
const HomeworkCard = ({ homework, homeworkId }: Props): JSX.Element => {
  const queryClient = useQueryClient();
  const toggleCompletedMutation = useToggleCompleted();
  const deleteHomeworkMutation = useDeleteHomework();
  const [isMutating, setIsMutating] = useState(false);

  function onClickToggleCompleted(
    e: React.MouseEvent<HTMLButtonElement>,
  ): void {
    e.preventDefault();
    setIsMutating(true);
    toggleCompletedMutation.mutate(homeworkId, {
      onSuccess: () => {
        void queryClient.invalidateQueries(['homeworks']);
      },
      onSettled: () => {
        setIsMutating(false);
      },
    });
  }

  function onClickDelete(e: React.MouseEvent<HTMLButtonElement>): void {
    e.preventDefault();
    setIsMutating(true);
    deleteHomeworkMutation.mutate(homeworkId, {
      onSuccess: () => {
        void queryClient.invalidateQueries(['homeworks']);
      },
      onSettled: () => {
        setIsMutating(false);
      },
    });
  }

  return (
    <Disclosure as="div" className="col-span-12 rounded-xl border-2">
      <Disclosure.Button className="relative w-full rounded-lg bg-gray-900/20 px-4 py-2 text-left text-sm font-medium hover:bg-slate-300 focus:outline-none">
        <p className="line-clamp-2 mr-10 break-words">{homework.title}</p>
        <div className="absolute -translate-y-1/2 top-1/2 right-3">
          {homework.completed ? (
            <FaCheckCircle className="inline text-xl text-green-500" />
          ) : (
            <MdPendingActions className="inline text-xl text-yellow-700" />
          )}
        </div>
      </Disclosure.Button>
      <Disclosure.Panel className="text-gray-500 bg-white rounded-b-xl p-2 sm:p-4">
        <p className="border-b-2 pb-3 break-words">{homework.description}</p>
        <div className="flex flex-wrap text-sm justify-between pt-3 place-items-end">
          <div className="flex flex-wrap gap-x-5 ">
            <p>
              <span className="font-semibold">State: </span>
              {homework.completed ? (
                <span className="inline-flex text-green-500">
                  {'Completed'}
                </span>
              ) : (
                <span className="inline-flex text-yellow-700 ">
                  <span className="block">{'Pending'}</span>
                </span>
              )}
            </p>
            <p>
              <span className="font-semibold">Due date: </span>
              {new Date(Number(homework.dueDate)).toUTCString()}
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <p className="text-yellow-600">
              Edit <AiOutlineEdit className="inline" />
            </p>
            <button type="button" onClick={onClickToggleCompleted}>
              {homework.completed ? (
                <span className="text-yellow-700">
                  Mark as uncompleted{' '}
                  <RiCheckboxIndeterminateLine className="inline" />
                </span>
              ) : (
                <span className="text-green-500">
                  Mark as completed <RiCheckboxLine className="inline" />
                </span>
              )}
            </button>
            <button
              type="button"
              className="text-red-500"
              onClick={onClickDelete}
            >
              Delete <HiOutlineTrash className="inline " />
            </button>
          </div>
        </div>
      </Disclosure.Panel>
      {/* Loader */}
      {isMutating && (
        <div className="fixed z-[1000] inset-0 bg-black/30 grid justify-center content-center justify-items-center">
          <p className="block text-white text-5xl text-center mb-10">
            Deleting message
          </p>
          <Loader className="block" />
        </div>
      )}
    </Disclosure>
  );
};

export default HomeworkCard;
