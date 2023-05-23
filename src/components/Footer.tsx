import { Link } from 'react-router-dom';

const Footer = (): JSX.Element => {
  return (
    <footer className="w-auto bg-white rounded-lg shadow mb-2 sm:m-2 md:m-4">
      <div className="mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
        <span className="text-sm text-gray-500 sm:text-center">
          © 2023{' '}
          <a
            href="https://github.com/motoko-bootcamp/motoko-starter/tree/main"
            className="hover:underline"
          >
            Motoko Bootcamp
          </a>
        </span>
        <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 sm:mt-0">
          <li>
            <Link to="/about" className="mr-4 hover:underline md:mr-6 ">
              About
            </Link>
          </li>
          <li>
            <Link
              to="https://github.com/matiasdsanchezr"
              className="hover:underline"
            >
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
