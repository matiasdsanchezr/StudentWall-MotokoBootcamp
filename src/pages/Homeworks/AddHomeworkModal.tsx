import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useCallback, useRef, useState } from 'react';
import { useAddHomework } from '../../hooks/homeworkDiary.hooks';
import { type Homework } from '../../declarations/studentWallBackend/studentWallBackend.did';
import { useQueryClient } from '@tanstack/react-query';
import Loader from '../../components/Loader';

interface Props {
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
}

const AddHomeworkModal = ({ showModal, setShowModal }: Props): JSX.Element => {
  const queryClient = useQueryClient();
  const titleRef = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState<string>('');
  const [isMutating, setIsMutating] = useState(false);
  const addHomeworkMutation = useAddHomework();

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>): void => {
      e.preventDefault();
      const title = titleRef.current?.value;
      if (title === undefined) return;

      if (description === undefined) return;

      const newHomework: Homework = {
        title,
        description,
        dueDate: BigInt(Date.now()),
        completed: false,
      };

      console.log(description);
      setIsMutating(true);
      addHomeworkMutation.mutate(newHomework, {
        onSuccess: () => {
          void queryClient.invalidateQueries(['homeworks']);
          setIsMutating(false);
          setShowModal(false);
        },
      });
    },
    [description],
  );

  return (
    <div>
      <Transition appear show={showModal} as={Fragment}>
        <Dialog
          as="div"
          onClose={() => {
            setShowModal(false);
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
                    Add new homework
                  </Dialog.Title>
                  <form className="flex-grow flex flex-col" onSubmit={onSubmit}>
                    <input type="text" placeholder="Title" ref={titleRef} />
                    <textarea
                      id="story"
                      className="p-2 bg-black/10 rounded-xl w-full flex-grow mb-4 resize-none border-2 border-gray-300"
                      placeholder="Write a message with a minimum of 10 characters..."
                      required={true}
                      onChange={(e) => {
                        setDescription(e.currentTarget.value);
                      }}
                      minLength={5}
                    />
                    <input type="date" />
                    <div className="ml-auto">
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={description.length < 10}
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      {/* Loader */}
      {isMutating && (
        <div className="fixed z-[1000] inset-0 bg-black/30 grid justify-center content-center justify-items-center">
          <p className="block text-white text-5xl text-center mb-10">
            Adding new homework
          </p>
          <Loader className="block" />
        </div>
      )}
    </div>
  );
};

export default AddHomeworkModal;
