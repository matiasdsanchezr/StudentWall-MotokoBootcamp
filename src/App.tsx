import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';
import ProtectedRoute from './layouts/ProtectedRoute';
import Home from './pages/Home';
// import Error404 from './pages/Error404';
import { AuthProvider } from './contexts/AuthContext';
import Messages from './pages/Messages';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SignInRoute from './layouts/SignInRoute';

import Profile from './pages/Profile';
import MessagesDetail from './pages/MessageDetail';
import PublicRoute from './layouts/PublicRoute';
import About from './pages/About';
import Homeworks from './pages/Homeworks';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // default: true
      networkMode: 'always',
    },
  },
});

function App(): JSX.Element {
  const router = createBrowserRouter([
    {
      element: <AuthProvider />,
      children: [
        {
          element: <PublicRoute />,
          children: [
            { path: '/home', element: <Home /> },
            { path: '/about', element: <About /> },
          ],
        },
        {
          element: <SignInRoute />,
          children: [
            {
              path: '/profile',
              element: <Profile />,
            },
          ],
        },
        {
          element: <ProtectedRoute />,
          children: [
            {
              path: '/messages',
              element: <Messages />,
            },
            {
              path: '/messages/:messageId',
              element: <MessagesDetail />,
            },
            {
              path: '/homeworks/',
              element: <Homeworks />,
            },
          ],
        },
        {
          path: '/*',
          element: <Navigate to="/home" />,
        },
      ],
    },
  ]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <RouterProvider router={router} />
      </div>
    </QueryClientProvider>
  );
}

export default App;
