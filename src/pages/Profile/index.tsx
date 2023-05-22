import { Fragment, useRef, useState } from 'react';
import { type StudentProfile } from '../../declarations/studentWallBackend/studentWallBackend.did';
import { Link } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { useUpdateProfile } from '../../hooks/user.hooks';
import { useAuth } from '../../contexts/AuthContext';

const Profile = (): JSX.Element => {
  const { refreshProfile } = useAuth();

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const teamRef = useRef<HTMLInputElement>(null);

  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDesc, setModalDesc] = useState('');

  const saveProfile = useUpdateProfile();

  function openModal(title: string, desc: string): void {
    setModalTitle(title);
    setModalDesc(desc);
    setShowModal(true);
  }

  function onClose(): void {
    setShowModal(false);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    const name = nameRef.current?.value;
    if (name == null) {
      openModal('Error', 'Please enter a valid name');
      return;
    }
    const email = emailRef.current?.value;
    if (email == null) {
      openModal('Error', 'Please enter a valid email');
      return;
    }
    const team = teamRef.current?.value;
    const profile: StudentProfile = {
      name,
      email,
      team: team != null ? [team] : [],
      graduate: false,
    };
    saveProfile.mutate(profile, {
      onSuccess: () => {
        void refreshProfile().then(() => {
          openModal('Success', 'Profile updated successfully');
        });
      },
      onError: () => {
        openModal(
          'Error',
          'An error occurred while saving your profile. Try again.',
        );
      },
    });
  }

  return (
    <div className="grid justify-items-center">
      <h2 className="text-4xl sm:text-5xl mb-6 sm:mb-7 m-3">Student Profile</h2>
      <form className="grid gap-5 w-56" onSubmit={onSubmit}>
        <div className="grid">
          <label htmlFor="name">
            <span className="text-red-600">*</span> Name
            <span className="text-red-600 italic ml-2 text-sm">Required</span>
          </label>
          <input
            type="text"
            className="input-primary"
            id="name"
            placeholder="Enter your name"
            ref={nameRef}
            required={true}
          />
        </div>
        <div className="grid">
          <label htmlFor="name">
            <span className="text-red-600">*</span> Email
            <span className="text-red-600 italic ml-2 text-sm">Required</span>
          </label>
          <input
            type="email"
            className="input-primary"
            id="email"
            placeholder="Enter your email"
            ref={emailRef}
            required={true}
          />
        </div>
        <div className="grid">
          <label htmlFor="name">Team</label>
          <input
            type="text"
            className="input-primary"
            id="team"
            placeholder="Optional team name"
            ref={teamRef}
          />
        </div>
        <div className="flex w-full py-2 justify-between">
          <button
            type="submit"
            className="btn-primary w-28"
            disabled={saveProfile.isLoading}
          >
            Save
          </button>
          <button
            type="reset"
            className="btn-primary"
            disabled={saveProfile.isLoading}
          >
            Reset
          </button>
        </div>
      </form>
      <Modal
        showModal={showModal}
        onClose={onClose}
        title={modalTitle}
        desc={modalDesc}
      />
    </div>
  );
};

interface ModalProps {
  showModal: boolean;
  onClose: () => void;
  title: string;
  desc: string;
}

const Modal = ({
  showModal,
  onClose,
  title,
  desc,
}: ModalProps): JSX.Element => {
  return (
    <Transition appear show={showModal} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
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
                  {title}
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={onClose}
                  >
                    Continue
                  </button>
                  <button
                    type="button"
                    className="ml-5 btn-primary"
                    onClick={onClose}
                  >
                    <Link to="/">Return to home</Link>
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Profile;
