import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchOrders, updateOrderStatus, clearOrderMessage } from '../features/orders/ordersSlice';
import { Widget } from '../components/ui/Widget';
import { Badge } from '../components/ui/Badge';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Table } from '../components/ui/Table';
import { Select } from '../components/ui/Select';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonTable } from '../components/ui/LoadingSpinner';
import { Alert } from '../components/ui/Alert';
import { useToast } from '../components/ui/Toast';
import { formatCurrency, formatDate } from '../utils/helpers';
import { ShoppingBag, Clock, CheckCircle, XCircle, ShoppingCart } from 'lucide-react';
import { Order } from '../types';

const STATUS_OPTIONS = [
  { value: '',           label: '— Change Status —' },
  { value: 'PENDING',    label: 'Pending' },
  { value: 'COMPLETED',  label: 'Completed' },
  { value: 'CANCELLED',  label: 'Cancelled' },
];

export default function OrderList() {
  const dispatch               = useAppDispatch();
  const { success, error: toastError } = useToast();

  const user       = useAppSelector((s) => s.auth.user);
  const orders     = useAppSelector((s) => s.orders.items);
  const loading    = useAppSelector((s) => s.orders.fetchStatus === 'loading');
  const message    = useAppSelector((s) => s.orders.message);
  const storeError = useAppSelector((s) => s.orders.error);

  const rawRole = user?.rawRole || '';
  const isAdmin = ['ADMIN', 'ADMIN_TYPE1', 'ADMIN_TYPE2'].includes(rawRole);

  useEffect(() => { dispatch(fetchOrders()); }, [dispatch]);

  useEffect(() => {
    if (message)    { success(toastError as any);    dispatch(clearOrderMessage()); }
    if (storeError) { toastError(storeError); dispatch(clearOrderMessage()); }
  }, [message, storeError]);

  const filteredOrders = useMemo(() => {
    if (isAdmin) return orders;
    return orders.filter((o) => o.userId === user?.id || o.userId === user?.email);
  }, [orders, isAdmin, user]);

  const handleStatusChange = async (orderId: string, status: string) => {
    if (!status) return;
    try {
      await dispatch(updateOrderStatus({ id: orderId, status: status as Order['status'] })).unwrap();
    } catch (err: any) {
      toastError(err.message || 'Failed to update status');
    }
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
      key: 'id',
      header: 'Order ID',
      sortable: true,
      render: (order: Order) => (
        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
          #{order.id}
        </span>
      ),
    },
    ...(isAdmin ? [{ key: 'userName', header: 'Customer', sortable: true }] : []),
    {
      key: 'createdAt',
      header: 'Date',
      sortable: true,
      render: (order: Order) => (
        <span className="text-xs text-slate-500 font-medium">{formatDate(order.createdAt)}</span>
      ),
    },
    {
      key: 'items',
      header: 'Items',
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
      key: 'totalAmount',
      header: 'Total',
      sortable: true,
      render: (order: Order) => (
        <span className="text-sm font-extrabold text-slate-900">{formatCurrency(order.totalAmount)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (order: Order) =>
        isAdmin ? (
          <Select
            value=""
            onChange={(e) => handleStatusChange(order.id, e.target.value)}
            options={STATUS_OPTIONS}
            containerClassName="w-40"
            aria-label="Change status"
          />
        ) : (
          getStatusBadge(order.status)
        ),
    },
    ...(isAdmin
      ? [{
          key: 'currentStatus',
          header: 'Current',
          render: (order: Order) => getStatusBadge(order.status),
        }]
      : []),
  ];

  if (loading && orders.length === 0) {
    return (
      <div className="page-enter">
        <Breadcrumb items={[{ label: 'Orders' }]} />
        <SkeletonTable rows={8} />
      </div>
    );
  }

  return (
    <div className="space-y-6 page-enter">
      <Breadcrumb items={[{ label: 'Orders' }]} />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {isAdmin ? 'All Orders' : 'My Orders'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isAdmin
              ? 'Track and manage all customer orders.'
              : 'View your order history and current status.'}
          </p>
        </div>
        <div className="flex-shrink-0 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm text-center">
          <p className="text-2xl font-extrabold text-slate-900">{filteredOrders.length}</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</p>
        </div>
      </div>

      {!loading && orders.length === 0 && (
        <Alert variant="info">
          <strong>Orders module:</strong> The orders backend is not yet implemented. Build the
          Spring Boot Order entity and controller as described in the integration roadmap (M1) to
          enable this section.
        </Alert>
      )}

      <Widget
        title={
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-slate-400" />
            <span>{filteredOrders.length} Order{filteredOrders.length !== 1 ? 's' : ''}</span>
          </div>
        }
        noPadding
      >
        {filteredOrders.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="w-12 h-12" />}
            title="No orders yet"
            description={
              isAdmin
                ? 'When customers place orders, they will appear here.'
                : "You haven't placed any orders yet."
            }
          />
        ) : (
          <Table
            data={filteredOrders}
            columns={columns}
            keyExtractor={(order) => order.id}
            hoverable
            striped
          />
        )}
      </Widget>
    </div>
  );
}