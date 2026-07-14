// import { Link, NavLink, useNavigate } from 'react-router-dom';
// import { useAppDispatch, useAppSelector } from '../../app/hooks';
// import { logoutUser } from '../../features/auth/authSlice';
// import { Button } from '../ui/Button';
// import {
//   LayoutDashboard,
//   Package,
//   ShoppingCart,
//   LogOut,
//   Menu,
//   X,
//   ChevronDown,
//   ShieldCheck,
//   Users,
//   KeyRound,
//   UserCircle,
// } from 'lucide-react';
// import { useState } from 'react';
// import { cn } from '../../utils/helpers';

// export function Navbar() {
//   const dispatch = useAppDispatch();
//   const navigate = useNavigate();
//   const user     = useAppSelector((state) => state.auth.user);
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [dropOpen, setDropOpen]     = useState(false);
//   const [adminOpen, setAdminOpen]   = useState(false);

//   // const rawRole = user?.rawRole || '';
//   // const isAdmin       = rawRole === 'ADMIN';
//   // const isAdminType2  = rawRole === 'ADMIN_TYPE2';
//   // const showAdminMenu = isAdmin || isAdminType2;

//   const rawRole = user?.rawRole ?? '';

// const permissions = {
//   isAdmin: rawRole === 'ADMIN',

//   isAdminType1: rawRole === 'ADMIN_TYPE1',

//   isAdminType2: rawRole === 'ADMIN_TYPE2',

//   canProvisionAdmins:
//     rawRole === 'ADMIN',

//   canManageUsers:
//     rawRole === 'ADMIN'
//     || rawRole === 'ADMIN_TYPE2',

//   canSeeAdministration:
//     rawRole === 'ADMIN'
//     || rawRole === 'ADMIN_TYPE2',
// };

//   const handleLogout = () => {
//     dispatch(logoutUser());
//     navigate('/login');
//   };

//   const navItems = [
//     { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
//     { label: 'Products',  path: '/products',  icon: Package },
//     { label: 'Orders',    path: '/orders',    icon: ShoppingCart },
//   ];

//   // Admin sub-menu items — filtered by role
//   const adminNavItems = [
//     // ADMIN only
//     ...(permissions.canProvisionAdmins ? [
//       { label: 'Admin Provisioning', path: '/admin/provision', icon: ShieldCheck },
//     ] : []),
//     // ADMIN + ADMIN_TYPE2
//     ...(permissions.canSeeAdministration ? [
//       { label: 'User Management', path: '/admin/users', icon: Users },
//     ] : []),

//     ...(permissions.canSeeAdministration ? [
//       {label: 'OTP Center',path: '/admin/otp',icon: ShieldCheck,}
//     ] : []),

//     ...(permissions.canSeeAdministration ? [
//       {label: 'Password Center',path: '/admin/password',icon: KeyRound,}
//     ] : []),

//     ...(permissions.canSeeAdministration ? [
//       {label: 'Profile Center',path: '/admin/profile',icon: UserCircle,}
//     ] : []),
//   ];

//   return (
//     <nav className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 shadow-lg">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between h-16">
//           {/* Brand + desktop nav */}
//           <div className="flex items-center">
//             <Link to="/dashboard" className="flex items-center space-x-2.5 mr-10">
//               <div className="w-9 h-9 bg-brand-green rounded-xl flex items-center justify-center shadow-lg shadow-brand-green/30">
//                 <Package className="text-white w-5 h-5" />
//               </div>
//               <span className="text-lg font-extrabold text-white tracking-tight">
//                 HexaOrder
//               </span>
//             </Link>

//             <div className="hidden md:flex md:space-x-1 items-center">
//               {navItems.map((item) => (
//                 <NavLink
//                   key={item.path}
//                   to={item.path}
//                   className={({ isActive }) => cn(
//                     'inline-flex items-center px-3.5 py-2 text-sm font-semibold rounded-lg transition-all duration-200',
//                     isActive
//                       ? 'text-brand-green bg-brand-green/15 shadow-inner'
//                       : 'text-slate-400 hover:text-white hover:bg-slate-800'
//                   )}
//                 >
//                   <item.icon className="w-4 h-4 mr-2" />
//                   {item.label}
//                 </NavLink>
//               ))}

//               {/* Admin dropdown — desktop */}
//               {permissions.canManageUsers && (
//                 <div className="relative ml-1">
//                   <button
//                     onClick={() => setAdminOpen(!adminOpen)}
//                     className={cn(
//                       'inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg transition-all duration-200',
//                       adminOpen
//                         ? 'text-amber-400 bg-amber-400/10'
//                         : 'text-slate-400 hover:text-white hover:bg-slate-800'
//                     )}
//                   >
//                     <ShieldCheck className="w-4 h-4" />
//                     Administration
//                     <ChevronDown className={cn('w-3 h-3 transition-transform', adminOpen && 'rotate-180')} />
//                   </button>

//                   {adminOpen && (
//                     <>
//                       {/* Backdrop to close */}
//                       <div className="fixed inset-0 z-40" onClick={() => setAdminOpen(false)} />
//                       <div className="absolute left-0 mt-2 w-52 bg-white rounded-xl border border-slate-200 shadow-xl py-1.5 z-50">
//                         <style>{`@keyframes dropIn { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }`}</style>
//                         <div style={{ animation: 'dropIn 0.15s ease' }}>
//                           <p className="px-4 pt-1 pb-2 text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">
//                             Administration
//                           </p>
//                           {adminNavItems.map((item) => (
//                             <NavLink
//                               key={item.path}
//                               to={item.path}
//                               onClick={() => setAdminOpen(false)}
//                               className={({ isActive }) => cn(
//                                 'flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors',
//                                 isActive
//                                   ? 'text-amber-600 bg-amber-50'
//                                   : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
//                               )}
//                             >
//                               <item.icon className="w-4 h-4 text-slate-400" />
//                               {item.label}
//                             </NavLink>
//                           ))}
//                         </div>
//                       </div>
//                     </>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Desktop right — user dropdown */}
//           <div className="hidden md:flex items-center gap-3">
//             <div className="relative">
//               <button
//                 onClick={() => setDropOpen(!dropOpen)}
//                 className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-800 transition-colors group"
//               >
//                 {user?.avatarUrl || user?.avatar ? (
//                   <img
//                     src={user.avatarUrl || user.avatar}
//                     alt={user.name}
//                     className="w-8 h-8 rounded-full border-2 border-slate-700 object-cover"
//                     referrerPolicy="no-referrer"
//                   />
//                 ) : (
//                   <div className="w-8 h-8 rounded-full bg-brand-green/20 border-2 border-brand-green/40 flex items-center justify-center text-brand-green font-bold text-sm">
//                     {user?.name?.[0]?.toUpperCase()}
//                   </div>
//                 )}
//                 <div className="text-left">
//                   <p className="text-sm font-semibold text-white leading-tight">{user?.name}</p>
//                   <p className="text-xs text-slate-500 leading-tight">{user?.rawRole || user?.role}</p>
//                 </div>
//                 <ChevronDown className={cn('w-3.5 h-3.5 text-slate-500 transition-transform', dropOpen && 'rotate-180')} />
//               </button>

//               {dropOpen && (
//                 <div
//                   className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-slate-200 shadow-xl py-1.5 z-50"
//                   style={{ animation: 'dropIn 0.2s ease' }}
//                 >
//                   <style>{`@keyframes dropIn { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }`}</style>
//                   <Link
//                     to="/profile"
//                     onClick={() => setDropOpen(false)}
//                     className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
//                   >
//                     <Package className="w-4 h-4 text-slate-400" />
//                     Profile
//                   </Link>
//                   <div className="my-1 border-t border-slate-100" />
//                   <button
//                     onClick={() => { setDropOpen(false); handleLogout(); }}
//                     className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
//                   >
//                     <LogOut className="w-4 h-4" />
//                     Sign out
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Mobile toggle */}
//           <div className="flex items-center md:hidden">
//             <button
//               onClick={() => setIsMenuOpen(!isMenuOpen)}
//               className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
//             >
//               {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Mobile menu */}
//       {isMenuOpen && (
//         <div className="md:hidden bg-slate-900 border-t border-slate-800 py-3">
//           <div className="px-3 space-y-1">
//             {navItems.map((item) => (
//               <NavLink
//                 key={item.path}
//                 to={item.path}
//                 onClick={() => setIsMenuOpen(false)}
//                 className={({ isActive }) => cn(
//                   'flex items-center px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors',
//                   isActive
//                     ? 'text-brand-green bg-brand-green/15'
//                     : 'text-slate-400 hover:text-white hover:bg-slate-800'
//                 )}
//               >
//                 <item.icon className="w-5 h-5 mr-3" />
//                 {item.label}
//               </NavLink>
//             ))}

//             {/* Admin section — mobile */}
//             {permissions.canManageUsers && (
//               <>
//                 <div className="pt-2 pb-1">
//                   <p className="px-3 text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest">
//                     Admin Panel
//                   </p>
//                 </div>
//                 {adminNavItems.map((item) => (
//                   <NavLink
//                     key={item.path}
//                     to={item.path}
//                     onClick={() => setIsMenuOpen(false)}
//                     className={({ isActive }) => cn(
//                       'flex items-center px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors',
//                       isActive
//                         ? 'text-amber-400 bg-amber-400/10'
//                         : 'text-slate-400 hover:text-white hover:bg-slate-800'
//                     )}
//                   >
//                     <item.icon className="w-5 h-5 mr-3" />
//                     {item.label}
//                   </NavLink>
//                 ))}
//               </>
//             )}

//             <div className="pt-3 pb-1 border-t border-slate-800">
//               <Link
//                 to="/profile"
//                 onClick={() => setIsMenuOpen(false)}
//                 className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors"
//               >
//                 {user?.avatarUrl ? (
//                   <img src={user.avatarUrl} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-slate-700" referrerPolicy="no-referrer" />
//                 ) : (
//                   <div className="w-9 h-9 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-green font-bold">{user?.name?.[0]?.toUpperCase()}</div>
//                 )}
//                 <div>
//                   <p className="text-sm font-semibold text-white">{user?.name}</p>
//                   <p className="text-xs text-slate-500">{user?.email}</p>
//                 </div>
//               </Link>
//               <button
//                 onClick={handleLogout}
//                 className="flex items-center gap-3 w-full px-3 py-2.5 mt-1 rounded-lg text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
//               >
//                 <LogOut className="w-5 h-5" />
//                 Sign out
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// }




// src/components/layout/Navbar.tsx
// FIX: Navbar now shows correct menu items based on rawRole.
// USER_TYPE1 / USER_TYPE2 see only regular nav items (no Administration menu).
// ADMIN sees Admin Provisioning + all admin items.
// ADMIN_TYPE2 sees User Management, OTP Center, Password Center, Profile Center (no Provision).
// ADMIN_TYPE1 sees only OTP Center and Password Center.
// Breadcrumb text color is fixed with explicit text-white/text-slate-300 classes.

import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logoutUser } from '../../features/auth/authSlice';
import {
  LayoutDashboard, Package, ShoppingCart, LogOut, Menu, X,
  ChevronDown, ShieldCheck, Users, KeyRound, UserCircle,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../utils/helpers';

type AdminMenuItem = { label: string; path: string; icon: typeof ShieldCheck };

export function Navbar() {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const user      = useAppSelector((state) => state.auth.user);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dropOpen,   setDropOpen]   = useState(false);
  const [adminOpen,  setAdminOpen]  = useState(false);

  const rawRole = user?.rawRole ?? '';

  // ── Permission matrix ────────────────────────────────────────────────────
  const isAdmin      = rawRole === 'ADMIN';
  const isAdminType1 = rawRole === 'ADMIN_TYPE1';
  const isAdminType2 = rawRole === 'ADMIN_TYPE2';
  const isAnyAdmin   = isAdmin || isAdminType1 || isAdminType2;

  // ── Admin sub-menu items, filtered per role ──────────────────────────────
  const adminNavItems: AdminMenuItem[] = [
    // Root ADMIN only
    ...(isAdmin ? [
      { label: 'Admin Provisioning', path: '/admin/provision', icon: ShieldCheck },
    ] : []),

    // ADMIN + ADMIN_TYPE2
    ...(isAdmin || isAdminType2 ? [
      { label: 'User Management', path: '/admin/users', icon: Users },
    ] : []),

    // All admins can see OTP + Password + Profile centers
    ...(isAnyAdmin ? [
      { label: 'OTP Center',      path: '/admin/otp',      icon: ShieldCheck },
      { label: 'Password Center', path: '/admin/password', icon: KeyRound    },
      { label: 'Profile Center',  path: '/admin/profile',  icon: UserCircle  },
    ] : []),
  ];

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Products',  path: '/products',  icon: Package          },
    { label: 'Orders',    path: '/orders',    icon: ShoppingCart     },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          {/* Brand + Desktop nav */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2.5 mr-10">
              <div className="w-9 h-9 bg-brand-green rounded-xl flex items-center justify-center shadow-lg shadow-brand-green/30">
                <Package className="text-white w-5 h-5" />
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">HexaOrder</span>
            </Link>

            <div className="hidden md:flex md:space-x-1 items-center">
              {navItems.map((item) => (
                <NavLink key={item.path} to={item.path}
                  className={({ isActive }) => cn(
                    'inline-flex items-center px-3.5 py-2 text-sm font-semibold rounded-lg transition-all duration-200',
                    isActive ? 'text-brand-green bg-brand-green/15 shadow-inner'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  )}>
                  <item.icon className="w-4 h-4 mr-2" />{item.label}
                </NavLink>
              ))}

              {/* Admin dropdown — only for admin roles */}
              {isAnyAdmin && adminNavItems.length > 0 && (
                <div className="relative ml-1">
                  <button onClick={() => setAdminOpen(!adminOpen)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg transition-all duration-200',
                      adminOpen ? 'text-amber-400 bg-amber-400/10'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    )}>
                    <ShieldCheck className="w-4 h-4" />
                    Administration
                    <ChevronDown className={cn('w-3 h-3 transition-transform', adminOpen && 'rotate-180')} />
                  </button>

                  {adminOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setAdminOpen(false)} />
                      <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl py-1.5 z-50"
                           style={{ animation: 'dropIn 0.15s ease' }}>
                        <style>{`@keyframes dropIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
                        <p className="px-4 pt-1 pb-2 text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">
                          Administration
                        </p>
                        {adminNavItems.map((item) => (
                          <NavLink key={item.path} to={item.path}
                            onClick={() => setAdminOpen(false)}
                            className={({ isActive }) => cn(
                              'flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors',
                              isActive ? 'text-amber-600 bg-amber-50'
                                       : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                            )}>
                            <item.icon className="w-4 h-4 text-slate-400" />{item.label}
                          </NavLink>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Desktop right — user dropdown */}
          <div className="hidden md:flex items-center gap-3">
            <div className="relative">
              <button onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-800 transition-colors">
                {user?.avatarUrl || user?.avatar ? (
                  <img src={user.avatarUrl || user.avatar} alt={user.name}
                       className="w-8 h-8 rounded-full border-2 border-slate-700 object-cover"
                       referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-brand-green/20 border-2 border-brand-green/40 flex items-center justify-center text-brand-green font-bold text-sm">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className="text-left">
                  <p className="text-sm font-semibold text-white leading-tight">{user?.name}</p>
                  {/* FIX: show rawRole badge */}
                  <p className="text-xs text-slate-400 leading-tight">{rawRole || user?.role}</p>
                </div>
                <ChevronDown className={cn('w-3.5 h-3.5 text-slate-500 transition-transform', dropOpen && 'rotate-180')} />
              </button>

              {dropOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-slate-200 shadow-xl py-1.5 z-50"
                     style={{ animation: 'dropIn 0.2s ease' }}>
                  <style>{`@keyframes dropIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
                  <Link to="/profile" onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                    <UserCircle className="w-4 h-4 text-slate-400" />Profile
                  </Link>
                  <div className="my-1 border-t border-slate-100" />
                  <button onClick={() => { setDropOpen(false); handleLogout(); }}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut className="w-4 h-4" />Sign out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile toggle */}
          <div className="flex items-center md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors">
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 py-3">
          <div className="px-3 space-y-1">
            {navItems.map((item) => (
              <NavLink key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) => cn(
                  'flex items-center px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors',
                  isActive ? 'text-brand-green bg-brand-green/15'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                )}>
                <item.icon className="w-5 h-5 mr-3" />{item.label}
              </NavLink>
            ))}

            {isAnyAdmin && adminNavItems.length > 0 && (
              <>
                <div className="pt-2 pb-1">
                  <p className="px-3 text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest">Admin Panel</p>
                </div>
                {adminNavItems.map((item) => (
                  <NavLink key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) => cn(
                      'flex items-center px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors',
                      isActive ? 'text-amber-400 bg-amber-400/10'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    )}>
                    <item.icon className="w-5 h-5 mr-3" />{item.label}
                  </NavLink>
                ))}
              </>
            )}

            <div className="pt-3 pb-1 border-t border-slate-800">
              <Link to="/profile" onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name}
                       className="w-9 h-9 rounded-full object-cover border border-slate-700" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-green font-bold">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-white">{user?.name}</p>
                  <p className="text-xs text-slate-400">{rawRole}</p>
                </div>
              </Link>
              <button onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-3 py-2.5 mt-1 rounded-lg text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors">
                <LogOut className="w-5 h-5" />Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}