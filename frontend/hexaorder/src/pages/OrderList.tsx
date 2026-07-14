// import { useEffect, useMemo } from 'react';
// import { useAppDispatch, useAppSelector } from '../app/hooks';
// import { fetchOrders, updateOrderStatus, clearOrderMessage } from '../features/orders/ordersSlice';
// import { Widget } from '../components/ui/Widget';
// import { Badge } from '../components/ui/Badge';
// import { Breadcrumb } from '../components/ui/Breadcrumb';
// import { Table } from '../components/ui/Table';
// import { Select } from '../components/ui/Select';
// import { EmptyState } from '../components/ui/EmptyState';
// import { SkeletonTable } from '../components/ui/LoadingSpinner';
// import { Alert } from '../components/ui/Alert';
// import { useToast } from '../components/ui/Toast';
// import { formatCurrency, formatDate } from '../utils/helpers';
// import { ShoppingBag, Clock, CheckCircle, XCircle, ShoppingCart } from 'lucide-react';
// import { Order } from '../types';

// const STATUS_OPTIONS = [
//   { value: '',           label: '— Change Status —' },
//   { value: 'PENDING',    label: 'Pending' },
//   { value: 'COMPLETED',  label: 'Completed' },
//   { value: 'CANCELLED',  label: 'Cancelled' },
// ];

// export default function OrderList() {
//   const dispatch               = useAppDispatch();
//   const { success, error: toastError } = useToast();

//   const user       = useAppSelector((s) => s.auth.user);
//   const orders     = useAppSelector((s) => s.orders.items);
//   const loading    = useAppSelector((s) => s.orders.fetchStatus === 'loading');
//   const message    = useAppSelector((s) => s.orders.message);
//   const storeError = useAppSelector((s) => s.orders.error);

//   const rawRole = user?.rawRole || '';
//   const isAdmin = ['ADMIN', 'ADMIN_TYPE1', 'ADMIN_TYPE2'].includes(rawRole);

//   useEffect(() => { dispatch(fetchOrders()); }, [dispatch]);

//   useEffect(() => {
//     if (message)    { success(toastError as any);    dispatch(clearOrderMessage()); }
//     if (storeError) { toastError(storeError); dispatch(clearOrderMessage()); }
//   }, [message, storeError]);

//   const filteredOrders = useMemo(() => {
//     if (isAdmin) return orders;
//     return orders.filter((o) => o.userId === user?.id || o.userId === user?.email);
//   }, [orders, isAdmin, user]);

//   const handleStatusChange = async (orderId: string, status: string) => {
//     if (!status) return;
//     try {
//       await dispatch(updateOrderStatus({ id: orderId, status: status as Order['status'] })).unwrap();
//     } catch (err: any) {
//       toastError(err.message || 'Failed to update status');
//     }
//   };

//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case 'COMPLETED': return <Badge variant="success" leftIcon={<CheckCircle className="w-3 h-3" />}>Completed</Badge>;
//       case 'PENDING':   return <Badge variant="warning" leftIcon={<Clock className="w-3 h-3" />}>Pending</Badge>;
//       case 'CANCELLED': return <Badge variant="error"   leftIcon={<XCircle className="w-3 h-3" />}>Cancelled</Badge>;
//       default:          return <Badge>{status}</Badge>;
//     }
//   };

//   const columns = [
//     {
//       key: 'id',
//       header: 'Order ID',
//       sortable: true,
//       render: (order: Order) => (
//         <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
//           #{order.id}
//         </span>
//       ),
//     },
//     ...(isAdmin ? [{ key: 'userName', header: 'Customer', sortable: true }] : []),
//     {
//       key: 'createdAt',
//       header: 'Date',
//       sortable: true,
//       render: (order: Order) => (
//         <span className="text-xs text-slate-500 font-medium">{formatDate(order.createdAt)}</span>
//       ),
//     },
//     {
//       key: 'items',
//       header: 'Items',
//       render: (order: Order) => (
//         <div className="flex flex-col gap-0.5">
//           {order.items.map((item, idx) => (
//             <span key={idx} className="text-xs text-slate-600 truncate max-w-[180px]">
//               <span className="font-bold text-slate-800">{item.quantity}×</span> {item.productName}
//             </span>
//           ))}
//         </div>
//       ),
//     },
//     {
//       key: 'totalAmount',
//       header: 'Total',
//       sortable: true,
//       render: (order: Order) => (
//         <span className="text-sm font-extrabold text-slate-900">{formatCurrency(order.totalAmount)}</span>
//       ),
//     },
//     {
//       key: 'status',
//       header: 'Status',
//       render: (order: Order) =>
//         isAdmin ? (
//           <Select
//             value=""
//             onChange={(e) => handleStatusChange(order.id, e.target.value)}
//             options={STATUS_OPTIONS}
//             containerClassName="w-40"
//             aria-label="Change status"
//           />
//         ) : (
//           getStatusBadge(order.status)
//         ),
//     },
//     ...(isAdmin
//       ? [{
//           key: 'currentStatus',
//           header: 'Current',
//           render: (order: Order) => getStatusBadge(order.status),
//         }]
//       : []),
//   ];

//   if (loading && orders.length === 0) {
//     return (
//       <div className="page-enter">
//         <Breadcrumb items={[{ label: 'Orders' }]} />
//         <SkeletonTable rows={8} />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 page-enter">
//       <Breadcrumb items={[{ label: 'Orders' }]} />

//       <div className="flex items-start justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
//             {isAdmin ? 'All Orders' : 'My Orders'}
//           </h1>
//           <p className="text-sm text-slate-500 mt-1">
//             {isAdmin
//               ? 'Track and manage all customer orders.'
//               : 'View your order history and current status.'}
//           </p>
//         </div>
//         <div className="flex-shrink-0 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm text-center">
//           <p className="text-2xl font-extrabold text-slate-900">{filteredOrders.length}</p>
//           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</p>
//         </div>
//       </div>

//       {!loading && orders.length === 0 && (
//         <Alert variant="info">
//           <strong>Orders module:</strong> The orders backend is not yet implemented. Build the
//           Spring Boot Order entity and controller as described in the integration roadmap (M1) to
//           enable this section.
//         </Alert>
//       )}

//       <Widget
//         title={
//           <div className="flex items-center gap-2">
//             <ShoppingCart className="w-4 h-4 text-slate-400" />
//             <span>{filteredOrders.length} Order{filteredOrders.length !== 1 ? 's' : ''}</span>
//           </div>
//         }
//         noPadding
//       >
//         {filteredOrders.length === 0 ? (
//           <EmptyState
//             icon={<ShoppingBag className="w-12 h-12" />}
//             title="No orders yet"
//             description={
//               isAdmin
//                 ? 'When customers place orders, they will appear here.'
//                 : "You haven't placed any orders yet."
//             }
//           />
//         ) : (
//           <Table
//             data={filteredOrders}
//             columns={columns}
//             keyExtractor={(order) => order.id}
//             hoverable
//             striped
//           />
//         )}
//       </Widget>
//     </div>
//   );
// }

import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchOrders, updateOrderStatus, clearOrderMessage, createOrder } from '../features/orders/ordersSlice';
import { Badge } from '../components/ui/Badge';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Table } from '../components/ui/Table';
import { Select } from '../components/ui/Select';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonTable } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { formatCurrency, formatDate } from '../utils/helpers';
import {
  ShoppingBag, Clock, CheckCircle, XCircle, ShoppingCart, Plus, X
} from 'lucide-react';
import { Order } from '../types';

const STATUS_OPTIONS = [
  { value: '',          label: '— Change Status —' },
  { value: 'PENDING',   label: 'Pending' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function OrderList() {
  const dispatch               = useAppDispatch();
  const { success, error: toastError } = useToast();

  const user       = useAppSelector((s) => s.auth.user);
  const orders     = useAppSelector((s) => s.orders.items);
  const loading    = useAppSelector((s) => s.orders.fetchStatus === 'loading');
  const createStatus = useAppSelector((s) => s.orders.createStatus);
  const message    = useAppSelector((s) => s.orders.message);
  const storeError = useAppSelector((s) => s.orders.error);

  const rawRole = user?.rawRole || '';
  const isAdmin = ['ADMIN', 'ADMIN_TYPE1', 'ADMIN_TYPE2'].includes(rawRole);

  // New order modal state
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [newItems, setNewItems] = useState([{ productId: '', quantity: 1 }]);

  useEffect(() => { dispatch(fetchOrders()); }, [dispatch]);

  useEffect(() => {
    if (message)    { success(message);    dispatch(clearOrderMessage()); }
    if (storeError) { toastError(storeError); dispatch(clearOrderMessage()); }
  }, [message, storeError]);

  const filteredOrders = useMemo(() => {
    if (isAdmin) return orders;
    return orders.filter(
      (o) => o.userId === user?.id || o.userId === user?.email
    );
  }, [orders, isAdmin, user]);

  const handleStatusChange = async (orderId: string, status: string) => {
    if (!status) return;
    try {
      await dispatch(updateOrderStatus({ id: orderId, status: status as Order['status'] })).unwrap();
    } catch (err: any) { toastError(err.message || 'Failed to update status'); }
  };

  const handleCreateOrder = async () => {
    const validItems = newItems.filter(i => i.productId.trim() && i.quantity > 0);
    if (!validItems.length) { toastError('Add at least one item with a product ID.'); return; }
    try {
      await dispatch(createOrder({ items: validItems })).unwrap();
      setShowNewOrder(false);
      setNewItems([{ productId: '', quantity: 1 }]);
    } catch (err: any) { toastError(err.message || 'Failed to create order'); }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <Badge variant="success" leftIcon={<CheckCircle className="w-3 h-3" />}>Completed</Badge>;
      case 'PENDING':   return <Badge variant="warning" leftIcon={<Clock className="w-3 h-3" />}>Pending</Badge>;
      case 'CANCELLED': return <Badge variant="error"   leftIcon={<XCircle className="w-3 h-3" />}>Cancelled</Badge>;
      default:          return <Badge>{status}</Badge>;
    }
  };

  const columns = [
    {
      key: 'id', header: 'Order ID', sortable: true,
      render: (order: Order) => (
        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
          #{order.id}
        </span>
      ),
    },
    ...(isAdmin ? [{ key: 'userName', header: 'Customer', sortable: true }] : []),
    {
      key: 'createdAt', header: 'Date', sortable: true,
      render: (order: Order) => (
        <span className="text-xs text-slate-500 font-medium">{formatDate(order.createdAt)}</span>
      ),
    },
    {
      key: 'items', header: 'Items',
      render: (order: Order) => (
        <div className="flex flex-col gap-0.5">
          {order.items.map((item, idx) => (
            <span key={idx} className="text-xs text-slate-600 truncate max-w-[180px]">
              <span className="font-bold text-slate-800">{item.quantity}×</span> {item.productName}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'totalAmount', header: 'Total', sortable: true,
      render: (order: Order) => (
        <span className="font-bold text-slate-800 text-sm">{formatCurrency(order.totalAmount)}</span>
      ),
    },
    {
      key: 'status', header: 'Status', sortable: true,
      render: (order: Order) => getStatusBadge(order.status),
    },
    ...(isAdmin ? [{
      key: 'statusAction', header: 'Update Status',
      render: (order: Order) => (
        <Select
          value=""
          onChange={(e) => handleStatusChange(order.id, e.target.value)}
          options={STATUS_OPTIONS}
          className="text-xs w-40"
        />
      ),
    }] : []),
  ];

  const pendingCount   = filteredOrders.filter(o => o.status === 'PENDING').length;
  const completedCount = filteredOrders.filter(o => o.status === 'COMPLETED').length;
  const totalRevenue   = filteredOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);

  return (
    <div className="space-y-6 page-enter">
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: isAdmin ? 'All Orders' : 'My Orders' },
      ]} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            {isAdmin ? 'All Orders' : 'My Orders'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {isAdmin ? 'Manage and update order statuses across all customers.' : 'View your order history.'}
          </p>
        </div>
        {!isAdmin && (
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowNewOrder(true)}>
            New Order
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders',    value: filteredOrders.length, icon: ShoppingBag, color: 'text-brand-green' },
          { label: 'Pending',         value: pendingCount,           icon: Clock,        color: 'text-amber-400'   },
          { label: 'Completed',       value: completedCount,          icon: CheckCircle,  color: 'text-emerald-400' },
          { label: 'Total Revenue',   value: formatCurrency(totalRevenue), icon: ShoppingCart, color: 'text-blue-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-slate-900/70 border border-slate-700 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-xs text-slate-400 font-medium">{label}</span>
            </div>
            <p className={`text-xl font-extrabold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* New Order Modal */}
      {showNewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">New Order</h3>
              <button onClick={() => setShowNewOrder(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 mb-4">
              {newItems.map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    placeholder="Product ID"
                    value={item.productId}
                    onChange={(e) => {
                      const updated = [...newItems];
                      updated[idx].productId = e.target.value;
                      setNewItems(updated);
                    }}
                    className="flex-1"
                  />
                  <input
                    type="number" min={1} value={item.quantity}
                    onChange={(e) => {
                      const updated = [...newItems];
                      updated[idx].quantity = Number(e.target.value);
                      setNewItems(updated);
                    }}
                    className="w-20 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm"
                  />
                  {newItems.length > 1 && (
                    <button onClick={() => setNewItems(newItems.filter((_, i) => i !== idx))}
                            className="text-red-400 hover:text-red-300">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full mb-4"
              onClick={() => setNewItems([...newItems, { productId: '', quantity: 1 }])}>
              + Add Item
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowNewOrder(false)}>Cancel</Button>
              <Button className="flex-1" isLoading={createStatus === 'loading'} onClick={handleCreateOrder}>
                Place Order
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
    {/* Orders Table */}

{loading ? (

    <SkeletonTable rows={5} />

) : filteredOrders.length === 0 ? (

    <EmptyState
        icon={<ShoppingCart className="w-12 h-12 text-slate-600" />}
        title="No orders yet"
        description={
            isAdmin
                ? "No orders have been placed."
                : "You have no orders. Place your first order!"
        }
        action={
            !isAdmin
                ? {
                    label: "New Order",
                    onClick: () => setShowNewOrder(true),
                    icon: <Plus className="w-4 h-4" />,
                  }
                : undefined
        }
    />

) : (

    <div className="bg-slate-900/70 border border-slate-700 rounded-2xl shadow-xl overflow-hidden">

        <Table
            columns={columns}
            data={filteredOrders}
            keyExtractor={(o) => o.id}
        />

    </div>

)}
    </div>
  );
}