import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

import Footer from '../components/Footer';

const PublicRoute = (): JSX.Element => {
  return (
    <>
      <header className="mb-20">
        <Navbar />
      </header>
      <main>
        <Outlet />
      </main>
      <footer>
        <Footer />
      </footer>
    </>
  );
};

export default PublicRoute;
