import { JSX, lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '../routes/ProtectedRoute';
import { RoleProtectedRoute } from '../routes/RoleProtectedRoute';
import { PageLoader } from '../components/ui/LoadingSpinner';
// import EmailVerifyPage from '@/pages/EmailVerify';
// import PasswordCenter from '@/pages/PasswordCenter';
// import PhoneLogin from '@/pages/PhoneLogin';

// Lazy load all pages
const Home = lazy(() => import('../pages/Home'));
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
const AdminProvisionPanel = lazy(() => import('../pages/AdminProvisionPanel'));
const AdminUserPanel = lazy(() => import('../pages/AdminUserPanel'));
const OtpAdminCenter = lazy(() => import('../pages/OtpAdminCenter'));
const PasswordCenter = lazy(() => import('../pages/PasswordCenter'));
const ProfileCenter = lazy(() => import('../pages/ProfileCenter'));
const EmailVerifyPage = lazy(() => import('../pages/EmailVerify') );

// const wrap = (C: React.LazyExoticComponent<() => JSX.Element>) => (
//   <Suspense fallback={<PageLoader />}>
//     <C />
//   </Suspense>
// );

// export const routes: RouteObject[] = [
//   // Root redirect 
//   { path: '/', element: wrap(Home) },
//   //  Public routes
//   { path: '/login',           element: wrap(Login) },
//   { path: '/signup',          element: wrap(Signup) },
//   { path: '/forgot-password', element: wrap(ForgotPassword) },
//   { path: '/oauth2/callback', element: wrap(OAuth2Callback) },
//   { path: '/phone-login',     element: wrap(PhoneLogin) },

//   // Authenticated routes (any logged-in user) 
//   {
//     element: <ProtectedRoute />,
//     children: [
//       { path: '/dashboard', element: wrap(Dashboard) },
//       { path: '/products',  element: wrap(ProductList) },
//       { path: '/products/:id', element: wrap(ProductDetail) },
//       { path: '/orders',    element: wrap(OrderList) },
//       { path: '/profile',   element: wrap(Profile) },
//     ],
//   },

//   // Admin-only routes 
//   {
//     element: (<RoleProtectedRoute allowedRoles={['ADMIN', 'ADMIN_TYPE1', 'ADMIN_TYPE2']} />),
//     children: [
//       { path: '/products/new',       element: wrap(ProductForm) },
//       { path: '/products/:id/edit',  element: wrap(ProductForm) },
//     ],
//   },
//   {
//   element: (<RoleProtectedRoute allowedRoles={['ADMIN','ADMIN_TYPE2',]}/>),
//   children: [
//     {
//       path: '/admin/users',element: wrap(AdminUserPanel),
//     },
//   ],
// },

// {
//   element: (<RoleProtectedRoute allowedRoles={['ADMIN',]}/>),
//   children: [
//     {path: '/admin/provision', element: wrap(AdminProvisionPanel)},
//     {path: '/admin/otp',element: wrap(OtpAdminCenter),},
//     {path: '/admin/password',element: wrap(PasswordCenter),},
//     {path: '/admin/profile', element: wrap(ProfileCenter),},  
//   ],
// },

//   // Catch-all
//   { path: '*', element: <Navigate to="/dashboard" replace /> },
// ];

// export const router = createBrowserRouter(routes);

// src/app/router.tsx
// FIX: Route guards now use rawRole correctly.
// /admin/otp and /admin/password and /admin/profile are accessible to ALL admin roles.
// /admin/users accessible to ADMIN + ADMIN_TYPE2.
// /admin/provision accessible to ADMIN only.
// Removed ResetPassword page (it's merged into ForgotPassword flow).

const wrap = (C: React.LazyExoticComponent<() => JSX.Element>) => (
  <Suspense fallback={<PageLoader />}><C /></Suspense>
);

export const routes: RouteObject[] = [
  // ── Public ──────────────────────────────────────────────────────────────
  { path: '/',                element: wrap(Home) },
  { path: '/login',           element: wrap(Login) },
  { path: '/signup',          element: wrap(Signup) },
  { path: '/forgot-password', element: wrap(ForgotPassword) },
  { path: '/oauth2/callback', element: wrap(OAuth2Callback) },
  { path: '/verify-email',    element: wrap(EmailVerifyPage) },
  { path: '/phone-login',     element: wrap(PhoneLogin) },

  // ── Authenticated (any logged-in user) ──────────────────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/dashboard',        element: wrap(Dashboard)     },
      { path: '/products',         element: wrap(ProductList)   },
      { path: '/products/:id',     element: wrap(ProductDetail) },
      { path: '/orders',           element: wrap(OrderList)     },
      { path: '/profile',          element: wrap(Profile)       },
    ],
  },

  // ── Any admin role: product management ────────────────────────────────
  {
    element: <RoleProtectedRoute allowedRoles={['ADMIN', 'ADMIN_TYPE1', 'ADMIN_TYPE2']} />,
    children: [
      { path: '/products/new',      element: wrap(ProductForm) },
      { path: '/products/:id/edit', element: wrap(ProductForm) },
    ],
  },

  // ── ADMIN + ADMIN_TYPE2: user management ─────────────────────────────
  {
    element: <RoleProtectedRoute allowedRoles={['ADMIN', 'ADMIN_TYPE2']} />,
    children: [
      { path: '/admin/users', element: wrap(AdminUserPanel) },
    ],
  },

  // ── All admin roles: OTP center, password center, profile center ─────
  {
    element: <RoleProtectedRoute allowedRoles={['ADMIN', 'ADMIN_TYPE1', 'ADMIN_TYPE2']} />,
    children: [
      { path: '/admin/otp',      element: wrap(OtpAdminCenter) },
      { path: '/admin/password', element: wrap(PasswordCenter) },
      { path: '/admin/profile',  element: wrap(ProfileCenter)  },
    ],
  },

  // ── Root ADMIN only: admin provisioning ──────────────────────────────
  {
    element: <RoleProtectedRoute allowedRoles={['ADMIN']} />,
    children: [
      { path: '/admin/provision', element: wrap(AdminProvisionPanel) },
    ],
  },

  // ── Catch-all ─────────────────────────────────────────────────────────
  { path: '*', element: <Navigate to="/dashboard" replace /> },
];

export const router = createBrowserRouter(routes);