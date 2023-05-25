import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { useWriteMessageMutation } from '../../hooks/messages.hooks';
import { type Content } from '../../declarations/studentWallBackend/studentWallBackend.did';
import { useQueryClient } from '@tanstack/react-query';

interface Props {
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
}

const NewMessageModal = ({ showModal, setShowModal }: Props): JSX.Element => {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [isMutating, setIsMutating] = useState(false);

  const writeMessageMutation = useWriteMessageMutation();

  function onSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    setIsMutating(true);
    const messageContent: Content = { Text: content };
    writeMessageMutation.mutate(messageContent, {
      onSuccess: () => {
        setContent('');
        void queryClient.invalidateQueries({ queryKey: ['messages'] });
        void queryClient.invalidateQueries({ queryKey: ['messagesCount'] });
        setShowModal(false);
        setIsMutating(false);
      },
    });
  }

  function onChangeTextArea(e: React.ChangeEvent<HTMLTextAreaElement>): void {
    setContent(e.currentTarget.value);
  }

  return (
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
                      disabled={content.length < 10 || isMutating}
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
  );
};

export default NewMessageModal;
