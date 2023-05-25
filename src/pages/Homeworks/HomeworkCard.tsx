import { Disclosure } from '@headlessui/react';
import { type Homework } from '../../declarations/studentWallBackend/studentWallBackend.did';
import { FaCheckCircle } from 'react-icons/fa';
import { MdPendingActions } from 'react-icons/md';
import { BsCheck2Square } from 'react-icons/bs';
import { HiOutlineTrash } from 'react-icons/hi';
import { AiOutlineEdit } from 'react-icons/ai';
import { useDeleteHomework } from '../../hooks/homeworkDiary.hooks';
import type React from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface Props {
  homework: Homework;
  homeworkId: bigint;
}
const HomeworkCard = ({ homework, homeworkId }: Props): JSX.Element => {
  const queryClient = useQueryClient();
  const deleteHomework = useDeleteHomework();

  function onClickDelete(e: React.MouseEvent<HTMLButtonElement>): void {
    e.preventDefault();
    deleteHomework.mutate(homeworkId, {
      onSuccess: () => {
        void queryClient.invalidateQueries(['homeworks']);
      },
    });
  }

  return (
    <Disclosure
      as="div"
      className="w-full m-auto max-w-5xl h-min rounded-xl border-2"
    >
      <Disclosure.Button className="relative w-full rounded-lg bg-gray-900/20 px-4 py-2 text-left text-sm font-medium hover:bg-slate-300 focus:outline-none">
        <p className="line-clamp-2 mr-10">{homework.title}</p>

        <div className="absolute -translate-y-1/2 top-1/2 right-3">
          {homework.completed ? (
            <FaCheckCircle className="inline text-xl text-green-500" />
          ) : (
            <MdPendingActions className="inline text-xl text-yellow-700" />
          )}
        </div>
      </Disclosure.Button>
      <Disclosure.Panel className="text-gray-500 bg-white rounded-b-xl p-2 sm:p-4">
        <p className="border-b-2 pb-3">{homework.description}</p>
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
            <p className="text-green-500">
              Mark as completed <BsCheck2Square className="inline" />
            </p>
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
    </Disclosure>
  );
};

export default HomeworkCard;
