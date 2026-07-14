import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { router } from './app/router';
import { ToastProvider } from './components/ui/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;