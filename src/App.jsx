import { RouterProvider } from 'react-router-dom';
import { AuthProvider, ThemeModeProvider } from './contexts';
import router from './routes';
import './index.css';

function App() {
  return (
    <ThemeModeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeModeProvider>
  );
}

export default App;
