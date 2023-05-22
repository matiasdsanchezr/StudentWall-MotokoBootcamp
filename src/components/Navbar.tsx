import * as React from 'react';
import { BiMessageSquareDetail } from 'react-icons/bi';
import { FaUserAlt } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { Menu, Transition } from '@headlessui/react';
import { Link } from 'react-router-dom';

export enum NavbarSection {
  Home,
  Recents,
  MostLiked,
  Submit,
}

interface NavbarProps {
  activeSection?: NavbarSection;
}

interface UserDropdownProps {
  name: string;
  onLogout: () => void;
}

function UserDropdown({ name, onLogout }: UserDropdownProps) {
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex sm:mr-3 p-1 text-sm bg-gray-800 rounded-full md:mr-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600">
        <FaUserAlt
          className="text-white text-xl sm:text-2xl rounded-full"
          aria-label="user photo"
        />
      </Menu.Button>
      <Transition
        as={React.Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="z-50 absolute min-w-max max-w-[280px] right-0 mt-2 p-2 divide-y divide-gray-100 rounded-md bg-white shadow-lg">
          <div className="">
            <Menu.Item>
              <a className="block text-md font-medium">{name}</a>
            </Menu.Item>
          </div>
          <div className="grid gap-1">
            <Menu.Item>
              <Link to="/profile">
                <a className="" href="#">
                  My profile
                </a>
              </Link>
            </Menu.Item>
            <Menu.Item>
              <a className="" onClick={onLogout}>
                Logout
              </a>
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

const MenuDropdown = () => {
  return (
    <Menu as="div" className="">
      <Menu.Button className="inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
        <span className="sr-only">Open main menu</span>
        <svg
          className="w-6 h-6"
          aria-hidden="true"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
        </svg>
      </Menu.Button>
      <Menu.Items className="z-[100] absolute inset-x-0 top-0 p-5 bg-white/95 w-full grid gap-2 text-2xl border-b-[3px]">
        <Menu.Item>
          {({ active }) => (
            <a
              className={`${
                active && 'bg-blue-500'
              } block text-center border-b-[3px]`}
              href="#"
            >
              Close
            </a>
          )}
        </Menu.Item>
        <Menu.Item>
          {({ active }) => (
            <Link to="/">
              <a className={`${active && 'bg-blue-500'}`} href="#">
                Home
              </a>
            </Link>
          )}
        </Menu.Item>
        <Menu.Item>
          {({ active }) => (
            <Link to="/messages/recents">
              <a className={`${active && 'bg-blue-500'}`} href="#">
                Messages
              </a>
            </Link>
          )}
        </Menu.Item>
        <Menu.Item>
          {({ active }) => (
            <Link to="/homeworks">
              <a className={`${active && 'bg-blue-500'}`} href="#">
                Homeworks
              </a>
            </Link>
          )}
        </Menu.Item>
        <Menu.Item>
          {({ active }) => (
            <Link to="/projects">
              <a className={`${active && 'bg-blue-500'} block`} href="#">
                Send Project
              </a>
            </Link>
          )}
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
};

export default function NavbarComponent({ activeSection }: NavbarProps) {
  const { isAnonymous, profile, logout } = useAuth();

  return (
    <nav className="z-[99] fixed w-full bg-white border-gray-200 dark:bg-gray-900">
      <div className="max-w-screen-xl flex items-center justify-between mx-auto p-4">
        <a href="#" className="flex items-center">
          <BiMessageSquareDetail className="mr-1 sm:mr-3 text-3xl sm:text-4xl" />
          <span className="text-2xl font-semibold whitespace-nowrap dark:text-white">
            Students' Wall
          </span>
        </a>
        {!isAnonymous && profile ? (
          <>
            <div className="flex items-center md:order-2">
              <UserDropdown
                name={profile?.name ?? 'Anonymous'}
                onLogout={() => {
                  logout();
                }}
              />
              <MenuDropdown />
            </div>
            <div
              className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
              id="mobile-menu-2"
            >
              <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                <li>
                  <Link
                    to="/"
                    className="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                    aria-current="page"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/messages"
                    className="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                  >
                    Messages
                  </Link>
                </li>
                <li>
                  <Link
                    to="/homeworks"
                    className="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                  >
                    Homeworks
                  </Link>
                </li>
                {/* <li>
                  <a
                    href="#"
                    className="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                  >
                    Send Project
                  </a>
                </li> */}
              </ul>
            </div>
          </>
        ) : null}
      </div>
    </nav>
  );
}
