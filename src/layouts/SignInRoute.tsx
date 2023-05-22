import { Navigate, Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';

const SignInRoute = () => {
  const { principal, profile } = useAuth();

  if (principal?.isAnonymous()) return <Navigate to="/" replace />;

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

export default SignInRoute;
