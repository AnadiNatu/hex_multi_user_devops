import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchProducts } from '../features/products/productsSlice';
import { fetchOrders } from '../features/orders/ordersSlice';
import { Widget } from '../components/ui/Widget';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { OrdersChart } from '../components/charts/OrdersChart';
import { RevenueChart } from '../components/charts/RevenueChart';
import { SkeletonCard } from '../components/ui/LoadingSpinner';
import { formatCurrency } from '../utils/helpers';
import {
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Plus,
  ArrowRight,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';

export default function Dashboard() {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();

  const user       = useAppSelector((s) => s.auth.user);
  const products   = useAppSelector((s) => s.products.items);
  const statistics = useAppSelector((s) => s.products.statistics);
  const orders     = useAppSelector((s) => s.orders.items);
  const loadingP   = useAppSelector((s) => s.products.fetchStatus === 'loading');
  const loadingO   = useAppSelector((s) => s.orders.fetchStatus === 'loading');

  const rawRole  = user?.rawRole || '';
  const isAdmin  = ['ADMIN', 'ADMIN_TYPE1', 'ADMIN_TYPE2'].includes(rawRole);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchOrders());
  }, [dispatch]);

  // Derived stats 
  const totalProducts   = statistics?.totalProducts   ?? products.length;
  const activeProducts  = statistics?.activeProducts  ?? products.filter((p) => p.isActive).length;
  const lowStock        = products.filter((p) => p.stock <= 10 && p.isActive).length;
  const totalOrders     = orders.length;
  const pendingOrders   = orders.filter((o) => o.status === 'PENDING').length;
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED').length;
  const totalRevenue    = orders
    .filter((o) => o.status === 'COMPLETED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const recentOrders   = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);

  const recentProducts = [...products].slice(0, 4);

  //Stat cards 
  const adminStats = [
    {
      label: 'Total Products',
      value: totalProducts,
      icon: Package,
      color: 'text-brand-green',
      bg: 'bg-brand-green/10',
      action: () => navigate('/products'),
    },
    {
      label: 'Active Products',
      value: activeProducts,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      action: () => navigate('/products'),
    },
    {
      label: 'Total Orders',
      value: totalOrders,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      action: () => navigate('/orders'),
    },
    {
      label: 'Revenue',
      value: formatCurrency(totalRevenue),
      icon: TrendingUp,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      action: () => navigate('/orders'),
    },
  ];

  const userStats = [
    {
      label: 'My Orders',
      value: totalOrders,
      icon: ShoppingCart,
      color: 'text-brand-green',
      bg: 'bg-brand-green/10',
      action: () => navigate('/orders'),
    },
    {
      label: 'Pending',
      value: pendingOrders,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      action: () => navigate('/orders'),
    },
    {
      label: 'Completed',
      value: completedOrders,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      action: () => navigate('/orders'),
    },
    {
      label: 'Browse Products',
      value: totalProducts,
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      action: () => navigate('/products'),
    },
  ];

  const stats = isAdmin ? adminStats : userStats;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success" leftIcon={<CheckCircle className="w-3 h-3" />}>Completed</Badge>;
      case 'PENDING':
        return <Badge variant="warning" leftIcon={<Clock className="w-3 h-3" />}>Pending</Badge>;
      case 'CANCELLED':
        return <Badge variant="error" leftIcon={<XCircle className="w-3 h-3" />}>Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 mt-1">
            {isAdmin
              ? "Here's what's happening with your store today."
              : "Here's an overview of your activity."}
          </p>
        </div>
        {isAdmin && rawRole === 'ADMIN' && (
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/products/new')}
          >
            Add Product
          </Button>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
       {loadingP && loadingO
        ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        : stats.map((stat, idx) => {
        const accentClasses = [
        'stat-accent-green',
        'stat-accent-emerald',
        'stat-accent-blue',
        'stat-accent-violet',
      ];
      return (
        <button
          key={stat.label}
          onClick={stat.action}
          className={`relative overflow-hidden bg-white rounded-xl border border-slate-200 p-6 text-left shadow-sm transition-all duration-250 hover:shadow-md hover:border-slate-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-brand-green/20 ${accentClasses[idx % accentClasses.length]}`}
        >
          <div className={`inline-flex p-3 rounded-xl ${stat.bg} mb-4`}>
            <stat.icon className={`w-6 h-6 ${stat.color}`} />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{stat.value}</p>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{stat.label}</p>
        </button>
      );
    })}
      </div>

      {/* Low stock alert — admin only */}
      {isAdmin && lowStock > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>{lowStock} product{lowStock > 1 ? 's' : ''}</strong> running low on stock (≤ 10 units).
          </p>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            onClick={() => navigate('/products')}
          >
            View
          </Button>
        </div>
      )}

      {/* Charts — admin only */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Widget title="Orders (Last 7 Days)" subtitle="Daily order breakdown by status">
            <div className="h-64">
              <OrdersChart orders={orders} days={7} />
            </div>
          </Widget>
          <Widget title="Revenue (Last 7 Days)" subtitle="Completed vs pending revenue">
            <div className="h-64">
              <RevenueChart orders={orders} days={7} />
            </div>
          </Widget>
        </div>
      )}

      {/* Recent orders + recent products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Widget
          title="Recent Orders"
          footer={
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => navigate('/orders')}
            >
              View All Orders
            </Button>
          }
        >
          {recentOrders.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No orders yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentOrders.map((order) => (
                <div key={order.id} className="py-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 font-mono truncate">
                      #{order.id}
                    </p>
                    {isAdmin && (
                      <p className="text-xs text-slate-500 truncate">{order.userName}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {getStatusBadge(order.status)}
                    <span className="text-sm font-bold text-slate-900">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Widget>

        {/* Recent Products */}
        <Widget
          title="Recent Products"
          footer={
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => navigate('/products')}
            >
              View All Products
            </Button>
          }
        >
          {recentProducts.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No products yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentProducts.map((product) => (
                <div
                  key={product.id}
                  className="py-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-10 h-10 rounded-lg object-cover border border-slate-100 flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-slate-300" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 truncate">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.category}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-brand-green">{formatCurrency(product.price)}</p>
                    <p className="text-xs text-slate-500">{product.stock} in stock</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Widget>
      </div>
    </div>
  );
}