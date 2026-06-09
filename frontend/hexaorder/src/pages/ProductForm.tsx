import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  createProduct, updateProduct, fetchProductById,
  clearSelectedProduct, clearProductMessage,
} from '../features/products/productsSlice';
import { Widget } from '../components/ui/Widget';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Alert } from '../components/ui/Alert';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { validateForm } from '../utils/validation';
import { ArrowLeft, Upload, X, Image as ImageIcon, Package } from 'lucide-react';
import { ProductFormData } from '../types';
import { cn } from '../utils/helpers';

const CATEGORIES = [
  'Electronics','Accessories','Furniture','Office Supplies',
  'Clothing','Books','Toys','Sports','Home','Other',
];

export default function ProductForm() {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const dispatch  = useAppDispatch();

  const selectedProduct = useAppSelector((s) => s.products.selectedProduct);
  const fetchStatus     = useAppSelector((s) => s.products.fetchStatus);
  const createStatus    = useAppSelector((s) => s.products.createStatus);
  const updateStatus    = useAppSelector((s) => s.products.updateStatus);
  const message         = useAppSelector((s) => s.products.message);
  const error           = useAppSelector((s) => s.products.error);

  const isEditMode = !!id;
  const isLoading  = createStatus === 'loading' || updateStatus === 'loading';

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile,    setImageFile]    = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [formData, setFormData] = useState<ProductFormData>({
    name: '', description: '', price: 0, stock: 0, category: 'Electronics', isActive: true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});

  useEffect(() => {
    if (isEditMode && id) dispatch(fetchProductById(id));
    return () => { dispatch(clearSelectedProduct()); dispatch(clearProductMessage()); };
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (selectedProduct && isEditMode) {
      setFormData({
        name: selectedProduct.name, description: selectedProduct.description,
        price: selectedProduct.price, stock: selectedProduct.stock,
        category: selectedProduct.category || 'Electronics', isActive: selectedProduct.isActive ?? true,
      });
      if (selectedProduct.image) setImagePreview(selectedProduct.image);
    }
  }, [selectedProduct, isEditMode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(selectedProduct?.image || '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'price' || name === 'stock' ? Number(value) : value }));
    if (errors[name as keyof ProductFormData]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateForm(formData, {
      name: { required: true, minLength: 2, maxLength: 200 },
      description: { required: true, minLength: 5 },
      price: { required: true, min: 0.01 },
      stock: { required: true, min: 0 },
      category: { required: true },
    });
    if (!validation.isValid) { setErrors(validation.errors as any); return; }
    try {
      if (isEditMode && id) {
        await dispatch(updateProduct({ id, formData, imageFile })).unwrap();
      } else {
        await dispatch(createProduct({ formData, imageFile })).unwrap();
      }
      navigate('/products');
    } catch {}
  };

  if (fetchStatus === 'loading' && isEditMode) return <PageLoader />;

  return (
    <div className="space-y-6 page-enter">
      <Breadcrumb items={[{ label: 'Products', href: '/products' }, { label: isEditMode ? 'Edit Product' : 'New Product' }]} />

      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => navigate('/products')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {isEditMode ? 'Edit Product' : 'Create New Product'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isEditMode ? 'Update product information and settings.' : 'Add a new product to your inventory.'}
          </p>
        </div>
      </div>

      {message && <Alert variant="success" dismissible onDismiss={() => dispatch(clearProductMessage())}>{message}</Alert>}
      {error   && <Alert variant="error"   dismissible onDismiss={() => dispatch(clearProductMessage())}>{error}</Alert>}

      <div className="max-w-3xl">
        <Widget>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input label="Product Name" name="name" value={formData.name} onChange={handleChange} error={errors.name} required placeholder="Premium Wireless Headphones" />
                <Select
                  label="Category" name="category" value={formData.category} onChange={handleChange}
                  error={errors.category as string}
                  options={CATEGORIES.map((c) => ({ value: c, label: c }))} required
                />
              </div>
              <div className="mt-5">
                <Textarea label="Description" name="description" value={formData.description} onChange={handleChange} error={errors.description} required rows={4} placeholder="Detailed product description..." />
              </div>
            </div>

            {/* Pricing & Stock */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
                Pricing & Inventory
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input label="Price (₹)" name="price" type="number" step="0.01" min="0" value={formData.price} onChange={handleChange} error={errors.price} required placeholder="299.99" />
                <Input label="Stock Quantity" name="stock" type="number" min="0" value={formData.stock} onChange={handleChange} error={errors.stock} required placeholder="50" />
              </div>
            </div>

            {/* Status toggle */}
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive ?? true}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-brand-green/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-green" />
              </label>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {formData.isActive ? 'Active' : 'Inactive'}
                </p>
                <p className="text-xs text-slate-500">
                  {formData.isActive ? 'Product is visible to users' : 'Product is hidden from users'}
                </p>
              </div>
            </div>

            {/* Image upload */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
                Product Image
              </h3>
              {imagePreview ? (
                <div className="relative inline-block">
                  <img src={imagePreview} alt="Preview" className="w-48 h-48 object-cover rounded-xl border-2 border-slate-200" referrerPolicy="no-referrer" />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'w-48 h-48 border-2 border-dashed border-slate-300 rounded-xl',
                    'flex flex-col items-center justify-center gap-2.5 text-slate-400',
                    'hover:border-brand-green hover:text-brand-green hover:bg-emerald-50/30 transition-all'
                  )}
                >
                  <div className="p-3 bg-slate-100 rounded-xl">
                    <ImageIcon className="w-7 h-7" />
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-bold block">Upload Image</span>
                    <span className="text-xs text-slate-400">JPG, PNG, WEBP · max 5MB</span>
                  </div>
                </button>
              )}

              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={handleFileChange} />

              {!imagePreview && (
                <Button type="button" variant="outline" size="sm" className="mt-3" leftIcon={<Upload className="w-4 h-4" />} onClick={() => fileInputRef.current?.click()}>
                  Choose File
                </Button>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
              <Button variant="ghost" type="button" onClick={() => navigate('/products')} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading} leftIcon={!isLoading ? <Package className="w-4 h-4" /> : undefined}>
                {isEditMode ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </form>
        </Widget>
      </div>
    </div>
  );
}