import { Navigate, Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';

const ProtectedRoute = (): JSX.Element => {
  const { principal, profile } = useAuth();

  if (principal == null || principal.isAnonymous() || profile == null)
    return <Navigate to="/" replace />;

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

export default ProtectedRoute;
