import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchProductById,
  clearSelectedProduct,
  updateProductStock,
  toggleProductActive,
} from '../features/products/productsSlice';
import { Button } from '../components/ui/Button';
import { Widget } from '../components/ui/Widget';
import { Badge } from '../components/ui/Badge';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { useToast } from '../components/ui/Toast';
import {
  ArrowLeft, ShoppingCart, ShieldCheck, Truck,
  RefreshCcw, Edit2, Package as PackageIcon,
  ToggleLeft, ToggleRight, Layers,
} from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

export default function ProductDetail() {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const dispatch  = useAppDispatch();
  const { success, error: toastError } = useToast();

  const product      = useAppSelector((s) => s.products.selectedProduct);
  const loading      = useAppSelector((s) => s.products.fetchStatus === 'loading');
  const updateStatus = useAppSelector((s) => s.products.updateStatus);
  const user         = useAppSelector((s) => s.auth.user);

  const rawRole      = user?.rawRole || '';
  const isAdmin      = ['ADMIN', 'ADMIN_TYPE1', 'ADMIN_TYPE2'].includes(rawRole);
  const isAdminType1 = rawRole === 'ADMIN_TYPE1';
  const isAdminType2 = rawRole === 'ADMIN_TYPE2';

  const [stockModal, setStockModal] = useState(false);
  const [newStock,   setNewStock]   = useState('');
  const [stockError, setStockError] = useState('');

  useEffect(() => {
    if (id) dispatch(fetchProductById(id));
    return () => { dispatch(clearSelectedProduct()); };
  }, [dispatch, id]);

  const handleStockUpdate = async () => {
    const qty = parseInt(newStock, 10);
    if (isNaN(qty) || qty < 0) { setStockError('Enter a valid quantity (≥ 0)'); return; }
    try {
      await dispatch(updateProductStock({ id: id!, quantity: qty })).unwrap();
      success('Stock updated successfully!');
      setStockModal(false);
      setNewStock('');
    } catch (err: any) {
      toastError(err.message || 'Failed to update stock');
    }
  };

  const handleToggleActive = async () => {
    try {
      await dispatch(toggleProductActive(id!)).unwrap();
      success('Product status updated!');
    } catch (err: any) {
      toastError(err.message || 'Failed to toggle status');
    }
  };

  if (loading) return <PageLoader />;

  if (!product) {
    return (
      <div className="page-enter">
        <Breadcrumb items={[{ label: 'Products', href: '/products' }, { label: 'Not Found' }]} />
        <EmptyState
          title="Product not found"
          description="The product you're looking for doesn't exist."
          action={{ label: 'Back to Products', onClick: () => navigate('/products'), icon: <ArrowLeft className="w-4 h-4" /> }}
        />
      </div>
    );
  }

  const stockVariant = product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'error';
  const stockLabel   = product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock';

  return (
    <div className="space-y-6 page-enter">
      <Breadcrumb items={[{ label: 'Products', href: '/products' }, { label: product.name }]} />

      {/* Action bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="ghost" onClick={() => navigate('/products')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back
        </Button>
        {isAdmin && (
          <Button variant="outline" onClick={() => navigate(`/products/${id}/edit`)} leftIcon={<Edit2 className="w-4 h-4" />}>
            Edit
          </Button>
        )}
        {isAdminType1 && (
          <Button variant="secondary" leftIcon={<Layers className="w-4 h-4" />}
            onClick={() => { setNewStock(String(product.stock)); setStockError(''); setStockModal(true); }}
          >
            Update Stock
          </Button>
        )}
        {isAdminType2 && (
          <Button
            variant={product.isActive ? 'outline' : 'primary'}
            leftIcon={product.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            onClick={handleToggleActive}
            isLoading={updateStatus === 'loading'}
          >
            {product.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image */}
        <Widget noPadding className="overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-auto object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-96 flex flex-col items-center justify-center bg-slate-50 text-slate-300 gap-3">
              <PackageIcon className="w-20 h-20" />
              <span className="text-sm font-medium text-slate-400">No image available</span>
            </div>
          )}
        </Widget>

        {/* Info */}
        <div className="space-y-6">
          {/* Category + status badges */}
          <div className="flex gap-2 flex-wrap">
            <Badge variant="info" className="uppercase tracking-widest text-xs">
              {product.category}
            </Badge>
            {isAdminType2 && (
              <Badge variant={product.isActive ? 'success' : 'default'}>
                {product.isActive ? 'Active' : 'Inactive'}
              </Badge>
            )}
          </div>

          {/* Name + price */}
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3 leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-3xl font-extrabold text-brand-green">
                {formatCurrency(product.price)}
              </span>
              <Badge variant={stockVariant}>{stockLabel}</Badge>
            </div>
          </div>

          {/* Description */}
          <Widget>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
          </Widget>

          {/* Feature pills */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: ShieldCheck, title: 'Warranty',  sub: '2 Years Limited' },
              { icon: Truck,       title: 'Shipping',  sub: 'Free Worldwide'  },
              { icon: RefreshCcw,  title: 'Returns',   sub: '30 Day Policy'   },
            ].map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex flex-col items-center gap-1.5 p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-center hover:border-brand-green/20 hover:bg-emerald-50/30 transition-colors">
                <Icon className="w-5 h-5 text-brand-green" />
                <p className="text-xs font-bold text-slate-800">{title}</p>
                <p className="text-xs text-slate-400 leading-tight">{sub}</p>
              </div>
            ))}
          </div>

          {/* Add to cart — users only */}
          {!isAdmin && (
            <div className="flex gap-3 pt-2">
              <Button
                size="lg"
                className="flex-1"
                leftIcon={<ShoppingCart className="w-5 h-5" />}
                disabled={product.stock === 0}
              >
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              <Button size="lg" variant="outline">Wishlist</Button>
            </div>
          )}

          {/* Admin meta */}
          {isAdmin && product.createdBy && (
            <div className="pt-4 border-t border-slate-100 space-y-1">
              <p className="text-xs text-slate-400">Created by: <span className="font-semibold text-slate-500">{product.createdBy}</span></p>
              {product.updatedBy && (
                <p className="text-xs text-slate-400">Last updated: <span className="font-semibold text-slate-500">{product.updatedBy}</span></p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stock Modal */}
      <Modal
        isOpen={stockModal}
        onClose={() => setStockModal(false)}
        title="Update Stock Quantity"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setStockModal(false)}>Cancel</Button>
            <Button onClick={handleStockUpdate} isLoading={updateStatus === 'loading'}>Save</Button>
          </>
        }
      >
        <div className="space-y-3">
          {stockError && <Alert variant="error">{stockError}</Alert>}
          <p className="text-sm text-slate-600">
            Current stock: <strong className="text-slate-900">{product.stock}</strong>
          </p>
          <Input
            label="New Quantity"
            type="number"
            min="0"
            value={newStock}
            onChange={(e) => { setNewStock(e.target.value); setStockError(''); }}
            leftIcon={<Layers className="w-4 h-4" />}
            placeholder="Enter new quantity"
          />
        </div>
      </Modal>
    </div>
  );
}