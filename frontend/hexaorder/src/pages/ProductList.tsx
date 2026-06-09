import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchProducts, searchProducts, deleteProduct,
  toggleProductActive, clearProductMessage, setPage,
} from '../features/products/productsSlice';
import { productsService } from '../features/products/productsService';
import { Widget } from '../components/ui/Widget';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { EmptyState } from '../components/ui/EmptyState';
import { Alert } from '../components/ui/Alert';
import { ConfirmDialog } from '../components/ui/Modal';
import { SkeletonTable } from '../components/ui/LoadingSpinner';
import { useDebounce } from '../hooks/useDebounce';
import { useToast } from '../components/ui/Toast';
import {
  Plus, Search, Edit2, Trash2, Eye, Package as PackageIcon,
  ToggleLeft, ToggleRight, ChevronLeft, ChevronRight, SlidersHorizontal,
} from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { Product } from '../types';

const SORT_OPTIONS = [
  { value: '',     label: 'Default sort' },
  { value: 'asc',  label: 'Price: Low → High' },
  { value: 'desc', label: 'Price: High → Low' },
];

export default function ProductList() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { success, error: toastError } = useToast();

  const user         = useAppSelector((s) => s.auth.user);
  const products     = useAppSelector((s) => s.products.items);
  const loading      = useAppSelector((s) => s.products.fetchStatus === 'loading');
  const deleteStatus = useAppSelector((s) => s.products.deleteStatus);
  const message      = useAppSelector((s) => s.products.message);
  const storeError   = useAppSelector((s) => s.products.error);
  const pagination   = useAppSelector((s) => s.products.pagination);

  const rawRole      = user?.rawRole || '';
  const isAdmin      = ['ADMIN', 'ADMIN_TYPE1', 'ADMIN_TYPE2'].includes(rawRole);
  const isAdminType2 = rawRole === 'ADMIN_TYPE2';
  const isUserType2  = rawRole === 'USER_TYPE2';

  const [searchTerm,      setSearchTerm]      = useState('');
  const [categoryFilter,  setCategoryFilter]  = useState('All');
  const [sortOrder,       setSortOrder]       = useState('');
  const [minPrice,        setMinPrice]        = useState('');
  const [maxPrice,        setMaxPrice]        = useState('');
  const [deleteConfirm,   setDeleteConfirm]   = useState<string | null>(null);
  const [showPriceFilter, setShowPriceFilter] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 500);
  const debouncedMin    = useDebounce(minPrice, 700);
  const debouncedMax    = useDebounce(maxPrice, 700);

  useEffect(() => {
    if (products.length === 0) dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    if (message)    { success(message);      dispatch(clearProductMessage()); }
    if (storeError) { toastError(storeError); dispatch(clearProductMessage()); }
  }, [message, storeError]);

  useEffect(() => {
    if (debouncedSearch.trim()) dispatch(searchProducts(debouncedSearch));
    else if (debouncedSearch === '') dispatch(fetchProducts());
  }, [debouncedSearch, dispatch]);

  const [priceFilteredProducts, setPriceFilteredProducts] = useState<Product[] | null>(null);
  useEffect(() => {
    if (!isUserType2) return;
    const min = parseFloat(debouncedMin), max = parseFloat(debouncedMax);
    if (!isNaN(min) && !isNaN(max) && min >= 0 && max > min) {
      productsService.getProductsByPriceRange(min, max).then(setPriceFilteredProducts).catch(() => setPriceFilteredProducts(null));
    } else { setPriceFilteredProducts(null); }
  }, [debouncedMin, debouncedMax, isUserType2]);

  const [sortedProducts, setSortedProducts] = useState<Product[] | null>(null);
  useEffect(() => {
    if (!isUserType2 || !sortOrder) { setSortedProducts(null); return; }
    productsService.getProductsSortedByPrice(sortOrder as 'asc' | 'desc').then(setSortedProducts).catch(() => setSortedProducts(null));
  }, [sortOrder, isUserType2]);

  const [categoryProducts, setCategoryProducts] = useState<Product[] | null>(null);
  useEffect(() => {
    if (categoryFilter === 'All') { setCategoryProducts(null); return; }
    productsService.getProductsByCategory(categoryFilter, rawRole).then(setCategoryProducts).catch(() => setCategoryProducts(null));
  }, [categoryFilter, rawRole]);

  const displayProducts = useMemo(() => {
    if (isUserType2 && sortedProducts)        return sortedProducts;
    if (isUserType2 && priceFilteredProducts) return priceFilteredProducts;
    if (categoryProducts)                     return categoryProducts;
    return products;
  }, [products, categoryProducts, priceFilteredProducts, sortedProducts, isUserType2]);

  const pageSize    = pagination.size;
  const currentPage = pagination.page;
  const totalPages  = Math.ceil(displayProducts.length / pageSize);
  const paginated   = displayProducts.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))],
    [products]
  );

  const handleDelete = async (id: string) => {
    await dispatch(deleteProduct(id)).unwrap().catch(() => {});
    setDeleteConfirm(null);
  };

  const handleToggleActive = async (id: string) => {
    await dispatch(toggleProductActive(id)).unwrap().catch(() => {});
  };

  if (loading && products.length === 0) {
    return (
      <div className="page-enter">
        <Breadcrumb items={[{ label: 'Products' }]} />
        <SkeletonTable rows={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6 page-enter">
      <Breadcrumb items={[{ label: 'Products' }]} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Products</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isAdmin ? 'Manage your inventory and product listings.' : 'Browse our product catalogue.'}
          </p>
        </div>
        {isAdmin && (
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate('/products/new')}>
            Add Product
          </Button>
        )}
      </div>

      <Widget noPadding>
        {/* Filter bar */}
        <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/50">
          <div className="flex flex-col md:flex-row gap-2.5">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); dispatch(setPage(0)); }}
              leftIcon={<Search className="w-4 h-4" />}
              containerClassName="flex-1"
            />
            <Select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); dispatch(setPage(0)); }}
              options={categories.map((c) => ({ value: c ?? 'Other', label: c ?? 'Other' }))}
              containerClassName="w-full md:w-44"
            />
            {isUserType2 && (
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                options={SORT_OPTIONS}
                containerClassName="w-full md:w-52"
              />
            )}
            {isUserType2 && (
              <Button
                variant={showPriceFilter ? 'secondary' : 'outline'}
                size="sm"
                leftIcon={<SlidersHorizontal className="w-4 h-4" />}
                onClick={() => setShowPriceFilter((v) => !v)}
              >
                Price Filter
              </Button>
            )}
          </div>

          {isUserType2 && showPriceFilter && (
            <div className="flex gap-2.5 items-center">
              <Input placeholder="Min ₹" type="number" min="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} containerClassName="w-32" />
              <span className="text-slate-400 font-bold">—</span>
              <Input placeholder="Max ₹" type="number" min="0" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} containerClassName="w-32" />
              {(minPrice || maxPrice) && (
                <Button variant="ghost" size="sm" onClick={() => { setMinPrice(''); setMaxPrice(''); }}>Clear</Button>
              )}
            </div>
          )}
        </div>

        {/* Product grid */}
        {paginated.length === 0 ? (
          <EmptyState
            icon={<PackageIcon className="w-12 h-12" />}
            title="No products found"
            description="Try adjusting your search or filters."
            action={isAdmin ? { label: 'Add Product', onClick: () => navigate('/products/new'), icon: <Plus className="w-4 h-4" /> } : undefined}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-5">
              {paginated.map((product) => (
                <div
                  key={product.id}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden group hover:shadow-lg hover:border-slate-300 hover:-translate-y-1 transition-all duration-250"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <PackageIcon className="w-14 h-14" />
                      </div>
                    )}
                    {/* Top-left accent stripe */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-green to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                      <Badge variant={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'error'}>
                        {product.stock} in stock
                      </Badge>
                      {isAdminType2 && (
                        <Badge variant={product.isActive ? 'success' : 'default'}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-1.5">
                      <h3 className="font-bold text-slate-900 truncate flex-1 text-sm">{product.name}</h3>
                      <span className="text-base font-extrabold text-brand-green ml-2 flex-shrink-0">
                        {formatCurrency(product.price)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed" style={{ minHeight: '2.25rem' }}>
                      {product.description}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {product.category}
                      </span>
                      <div className="flex items-center gap-0.5">
                        <Button variant="ghost" size="sm" className="p-1.5 hover:bg-slate-100" onClick={() => navigate(`/products/${product.id}`)}>
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        {isAdmin && (
                          <>
                            <Button variant="ghost" size="sm" className="p-1.5 hover:bg-slate-100" onClick={() => navigate(`/products/${product.id}/edit`)}>
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            {isAdminType2 && (
                              <Button variant="ghost" size="sm" className="p-1.5 text-amber-500 hover:bg-amber-50" onClick={() => handleToggleActive(product.id)}>
                                {product.isActive ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                              </Button>
                            )}
                            {rawRole === 'ADMIN' && (
                              <Button variant="ghost" size="sm" className="p-1.5 text-red-500 hover:bg-red-50" onClick={() => setDeleteConfirm(product.id)} isLoading={deleteStatus === 'loading'}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
                <p className="text-xs font-semibold text-slate-500">
                  {currentPage * pageSize + 1}–{Math.min((currentPage + 1) * pageSize, displayProducts.length)} of {displayProducts.length}
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => dispatch(setPage(currentPage - 1))} disabled={currentPage === 0} leftIcon={<ChevronLeft className="w-4 h-4" />}>
                    Prev
                  </Button>
                  <span className="text-xs font-bold text-slate-700 px-1.5">
                    {currentPage + 1} / {totalPages}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => dispatch(setPage(currentPage + 1))} disabled={currentPage >= totalPages - 1} rightIcon={<ChevronRight className="w-4 h-4" />}>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Widget>

      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}