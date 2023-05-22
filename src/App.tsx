import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ProtectedRoute from './layouts/ProtectedRoute';
import Home from './pages/Home';
// import Error404 from './pages/Error404';
import { AuthProvider } from './contexts/AuthContext';
import Messages from './pages/Messages';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SignInRoute from './layouts/SignInRoute';

import Profile from './pages/Profile';
import MessagesDetail from './pages/MessageDetail';

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
          path: '/home',
          element: <Home />,
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
          ],
        },
        {
          path: '/*',
          element: <Home />,
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
