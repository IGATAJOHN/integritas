import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts';
import router from './routes';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
