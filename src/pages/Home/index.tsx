import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

function Home(): JSX.Element {
  const { principal, login, isAnonymous, profile } = useAuth();

  return (
    <>
      <header>
        <Navbar />
      </header>
      <div className="grid justify-items-center content-center">
        <h3 className="mt-10 text-2xl leading-none text-gray-900 md:text-3xl lg:text-4xl">
          Welcome to
        </h3>
        <h1 className="mb-10 text-4xl leading-none text-gray-900 md:text-5xl lg:text-6xl">
          {"The Student's Wall"}
        </h1>

        <div className="border-2 rounded-md p-2 sm:p-5 grid justify-items-center gap-2 text-center">
          <h2 className="text-xl font-medium leading-none text-gray-900 md:text-2xl lg:text-3xl">
            Internet Identity Client
          </h2>
          {isAnonymous ? (
            <>
              <h3>You are not authenticated</h3>
              <h4>{principal?.toString()}</h4>
              <button
                type="button"
                className="m-3 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 focus:outline-none"
                onClick={login}
              >
                Login
              </button>
            </>
          ) : (
            <>
              <h3>Authenticated with id:</h3>
              <p className="text-center">{principal?.toString()}</p>
              {profile != null ? (
                <Link to="/messages">
                  <button
                    type="button"
                    className="m-3 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 focus:outline-none"
                  >
                    Go to messages
                  </button>
                </Link>
              ) : (
                <>
                  <h3 className="text-xl text-red-500">
                    You need to register a profile
                  </h3>
                  <Link to="/profile">
                    <button
                      type="button"
                      className="m-3 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 focus:outline-none"
                    >
                      Register
                    </button>
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Home;
