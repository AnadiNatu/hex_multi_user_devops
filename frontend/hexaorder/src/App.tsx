// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { Provider } from 'react-redux';
// import { store } from './app/store';
// import { AuthProvider } from './context/AuthContext';
// import { ProtectedRoute } from './routes/ProtectedRoute';
// import Login from './pages/Login';
// import Dashboard from './pages/Dashboard';
// import ProductList from './pages/ProductList';
// import ProductDetail from './pages/ProductDetail';
// import OrderList from './pages/OrderList';
// import Profile from './pages/Profile';

// function App() {
//   return (
//     <Provider store={store}>
//       <AuthProvider>
//         <BrowserRouter>
//           <Routes>
//             <Route path="/login" element={<Login />} />
//             <Route path="/" element={<Navigate to="/dashboard" replace />} />
//             <Route element={<ProtectedRoute />}>
//               <Route path="/dashboard" element={<Dashboard />} />
//               <Route path="/products" element={<ProductList />} />
//               <Route path="/products/:id" element={<ProductDetail />} />
//               <Route path="/orders" element={<OrderList />} />
//               <Route path="/profile" element={<Profile />} />
//             </Route>
//           </Routes>
//         </BrowserRouter>
//       </AuthProvider>
//     </Provider>
//   );
// }

// export default App;

// Updated to router

// import { RouterProvider } from 'react-router-dom';
// import { Provider } from 'react-redux';
// import { store } from './app/store';
// import { router } from './app/router';

// function App() {
//   return (
//     <Provider store={store}>
//       <RouterProvider router={router} />
//     </Provider>
//   );
// }

// export default App;

// Updated with Error Boundary and Toast
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