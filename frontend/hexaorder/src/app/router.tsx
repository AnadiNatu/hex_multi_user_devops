import { JSX, lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '../routes/ProtectedRoute';
import { RoleProtectedRoute } from '../routes/RoleProtectedRoute';
import { PageLoader } from '../components/ui/LoadingSpinner';
// import PhoneLogin from '@/pages/PhoneLogin';

// Lazy load all pages
const Login          = lazy(() => import('../pages/Login'));
const Signup         = lazy(() => import('../pages/Signup'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const OAuth2Callback = lazy(() => import('../pages/OAuth2Callback'));
const Dashboard      = lazy(() => import('../pages/Dashboard'));
const PhoneLogin     = lazy(() => import('../pages/PhoneLogin'))
const ProductList    = lazy(() => import('../pages/ProductList'));
const ProductDetail  = lazy(() => import('../pages/ProductDetail'));
const ProductForm    = lazy(() => import('../pages/ProductForm'));
const OrderList      = lazy(() => import('../pages/OrderList'));
const Profile        = lazy(() => import('../pages/Profile'));

const wrap = (C: React.LazyExoticComponent<() => JSX.Element>) => (
  <Suspense fallback={<PageLoader />}>
    <C />
  </Suspense>
);

export const routes: RouteObject[] = [
  // Root redirect 
  { path: '/', element: <Navigate to="/dashboard" replace /> },

  //  Public routes
  { path: '/login',           element: wrap(Login) },
  { path: '/signup',          element: wrap(Signup) },
  { path: '/forgot-password', element: wrap(ForgotPassword) },
  { path: '/oauth2/callback', element: wrap(OAuth2Callback) },
  { path: '/phone-login',     element: wrap(PhoneLogin) },

  // Authenticated routes (any logged-in user) 
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/dashboard', element: wrap(Dashboard) },
      { path: '/products',  element: wrap(ProductList) },
      { path: '/products/:id', element: wrap(ProductDetail) },
      { path: '/orders',    element: wrap(OrderList) },
      { path: '/profile',   element: wrap(Profile) },
    ],
  },

  // Admin-only routes 
    {
    element: (
      <RoleProtectedRoute allowedRoles={['ADMIN', 'ADMIN_TYPE1', 'ADMIN_TYPE2']} />
    ),
    children: [
      { path: '/products/new',       element: wrap(ProductForm) },
      { path: '/products/:id/edit',  element: wrap(ProductForm) },
    ],
  },

  // Catch-all
  { path: '*', element: <Navigate to="/dashboard" replace /> },
];

export const router = createBrowserRouter(routes);
