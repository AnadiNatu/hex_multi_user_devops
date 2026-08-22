
// import { useEffect, useMemo, useState } from 'react';
// import { useAppDispatch, useAppSelector } from '../app/hooks';
// import {
//     fetchOrders,
//     updateOrderStatus,
//     clearOrderMessage,
//     createOrder,
//     cancelOrder,
//     deleteOwnOrder,
//     deleteAdminOrder
// } from '../features/orders/ordersSlice';
// import { Badge } from '../components/ui/Badge';
// import { Breadcrumb } from '../components/ui/Breadcrumb';
// import { Table } from '../components/ui/Table';
// import { Select } from '../components/ui/Select';
// import { EmptyState } from '../components/ui/EmptyState';
// import { SkeletonTable } from '../components/ui/LoadingSpinner';
// import { Button } from '../components/ui/Button';
// import { Input } from '../components/ui/Input';
// import { useToast } from '../components/ui/Toast';
// import { formatCurrency, formatDate } from '../utils/helpers';
// import {
//   ShoppingBag, Clock, CheckCircle, XCircle, ShoppingCart, Plus, X,
//   Ship,
//   Loader,
//   CheckCircle2,
//   Search,
//   ChevronDown
// } from 'lucide-react';
// import { Order, Product } from '../types';
// import OrderDetailsDrawer from "../components/ui/OrderDetailsDrawer";
// import CancelOrderDialog from "../components/ui/CancelOrderDialog";
// import DeleteOrderDialog from "../components/ui/DeleteOrderDialog";
// import OrderStatusFilter from "../components/ui/OrderStatusFilter";
// import CustomerFilter from "../components/ui/CustomerFilter";


// const STATUS_OPTIONS = [
//   { value: '',          label: '— Change Status —' },
//   { value: 'PENDING',   label: 'Pending' },
//   { value: 'COMPLETED', label: 'Completed' },
//   { value: 'CANCELLED', label: 'Cancelled' },
// ];

// interface OrderItem {
//   productId: string;
//   productName?: string;
//   quantity: number;
//   price?: number;
//   category?: string;
// }

// interface ProductOption {
//   id: string;
//   name: string;
//   category: string;
//   price: number;
// }

// export default function OrderList() {
//   const dispatch               = useAppDispatch();
//   const { success, error: toastError } = useToast();

//   const user       = useAppSelector((s) => s.auth.user);
//   const orders     = useAppSelector((s) => s.orders.items);
//   const loading    = useAppSelector((s) => s.orders.fetchStatus === 'loading');
//   const createStatus = useAppSelector((s) => s.orders.createStatus);
//   const message    = useAppSelector((s) => s.orders.message);
//   const storeError = useAppSelector((s) => s.orders.error);

//   const rawRole = user?.rawRole || '';
//   const isAdmin = ['ADMIN', 'ADMIN_TYPE1', 'ADMIN_TYPE2'].includes(rawRole);

//   // ── New order modal state ────────────────────────────────────────────
//   const [showNewOrder, setShowNewOrder] = useState(false);
//   const [selectedOrder , setSelectedOrder] = useState<Order | null>(null);
//   const [drawerOpen , setDrawerOpen] = useState(false);
  
//   const [cancelDialogOpen , setCancelDialogOpen] = useState(false);
//   const [deleteDialogOpen , setDeleteDialogOpen] = useState(false);
//   const [dialogLoading , setDialogLoading] = useState(false);

//   const [statusFilter , setStatusFilter] = useState("");
//   const [customerFilter , setCustomerFilter] = useState("");

//   // ── Product fetching for order modal ─────────────────────────────────
//   const [products, setProducts] = useState<ProductOption[]>([]);
//   const [productsLoading, setProductsLoading] = useState(false);
//   const [newItems, setNewItems] = useState<OrderItem[]>([{ productId: '', quantity: 1 }]);
  
//   // Product search/filter state
//   const [productSearches, setProductSearches] = useState<string[]>(['']);
//   const [openDropdowns, setOpenDropdowns] = useState<boolean[]>([false]);

//   // ── Fetch orders on mount ────────────────────────────────────────────
//   useEffect(() => { dispatch(fetchOrders()); }, [dispatch]);

//   // ── Fetch products for dropdown ──────────────────────────────────────
//   useEffect(() => {
//     if (!showNewOrder) return;
    
//     const fetchProducts = async () => {
//       setProductsLoading(true);
//       try {
//         // TODO: Replace with your actual products API endpoint
//         const response = await fetch('/api/products');
//         const data = await response.json();
        
//         // Map backend products to ProductOption format
//         const mappedProducts: ProductOption[] = (data.products || data || []).map((p: any) => ({
//           id: String(p.id),
//           name: p.name,
//           category: p.category || 'Uncategorized',
//           price: typeof p.price === 'string' ? parseFloat(p.price) : (p.price || 0),
//         }));
        
//         setProducts(mappedProducts);
//       } catch (err) {
//         console.error('Failed to fetch products:', err);
//         toastError('Failed to load products');
//       } finally {
//         setProductsLoading(false);
//       }
//     };

//     fetchProducts();
//   }, [showNewOrder, toastError]);

//   // ── Filter products based on search term ─────────────────────────────
//   const getFilteredProducts = (searchTerm: string, index: number) => {
//     return products.filter(p => {
//       const searchLower = searchTerm.toLowerCase();
//       const matchesSearch = 
//         p.name.toLowerCase().includes(searchLower) ||
//         p.category.toLowerCase().includes(searchLower);
      
//       // Don't show already selected products
//       const isAlreadySelected = newItems.some((item, idx) => 
//         idx !== index && item.productId === p.id
//       );
      
//       return matchesSearch && !isAlreadySelected;
//     });
//   };

//   // ── Handle product selection ─────────────────────────────────────────
//   const handleSelectProduct = (index: number, product: ProductOption) => {
//     const updated = [...newItems];
//     updated[index] = {
//       productId: product.id,
//       productName: product.name,
//       quantity: updated[index].quantity || 1,
//       price: product.price,
//       category: product.category,
//     };
//     setNewItems(updated);
    
//     // Close dropdown
//     const newDropdowns = [...openDropdowns];
//     newDropdowns[index] = false;
//     setOpenDropdowns(newDropdowns);
//   };

//   // ── Handle search input ──────────────────────────────────────────────
//   const handleProductSearch = (index: number, value: string) => {
//     const newSearches = [...productSearches];
//     newSearches[index] = value;
//     setProductSearches(newSearches);
    
//     // Open dropdown if typing
//     if (value.length > 0) {
//       const newDropdowns = [...openDropdowns];
//       newDropdowns[index] = true;
//       setOpenDropdowns(newDropdowns);
//     }
//   };

//   // ── Toast notifications ──────────────────────────────────────────────
//   useEffect(() => {
//     if (message) {
//         success(message);
//         dispatch(clearOrderMessage());
//     }

//     if (storeError) {
//         toastError(storeError);
//         dispatch(clearOrderMessage());
//     }

// }, [message, storeError, dispatch, success, toastError]);

//   // ── Filter orders by status and customer ─────────────────────────────
//   const filteredOrders = useMemo(() => {
//     let data = isAdmin ? [...orders] : orders.filter(
//                   (o) =>
//                       o.userId === user?.id ||
//                       o.userId === user?.email );

//     if (statusFilter) data = data.filter(o => o.status === statusFilter);
//     if (customerFilter) data = data.filter(o => o.userEmail?.includes(customerFilter) || o.userName?.includes(customerFilter));

//     return data;
//   }, [orders, isAdmin, user, statusFilter, customerFilter]);

//   // ── Create order handler ─────────────────────────────────────────────
//   const handleCreateOrder = () => {
//     // Validation
//     const validItems = newItems.filter(item => item.productId.trim());
    
//     if (validItems.length === 0) {
//       toastError('Please select at least one product');
//       return;
//     }

//     if (validItems.some(item => item.quantity < 1)) {
//       toastError('Quantity must be at least 1');
//       return;
//     }

//     // Create order payload
//     const payload = {
//       items: validItems.map(item => ({
//         productId: item.productId,
//         quantity: item.quantity,
//       })),
//     };

//     dispatch(createOrder(payload));
    
//     // Reset form
//     setNewItems([{ productId: '', quantity: 1 }]);
//     setProductSearches(['']);
//     setOpenDropdowns([false]);
//     setShowNewOrder(false);
//   };

//   // ── Add new item row ─────────────────────────────────────────────────
//   const handleAddItem = () => {
//     setNewItems([...newItems, { productId: '', quantity: 1 }]);
//     setProductSearches([...productSearches, '']);
//     setOpenDropdowns([...openDropdowns, false]);
//   };

//   // ── Remove item row ──────────────────────────────────────────────────
//   const handleRemoveItem = (index: number) => {
//     if (newItems.length > 1) {
//       setNewItems(newItems.filter((_, i) => i !== index));
//       const newSearches = productSearches.filter((_, i) => i !== index);
//       setProductSearches(newSearches);
//       const newDropdowns = openDropdowns.filter((_, i) => i !== index);
//       setOpenDropdowns(newDropdowns);
//     }
//   };

//   return (
//     <div className="space-y-8 page-enter">
//       <Breadcrumb
//         items={[
//           { label: 'Dashboard', href: '/dashboard' },
//           { label: 'Orders' },
//         ]}
//       />

//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-white">Orders</h1>
//           <p className="mt-2 text-slate-400">
//             {isAdmin ? 'Manage all customer orders' : 'View and manage your orders'}
//           </p>
//         </div>
//         {/* ✅ SHOW BUTTON FOR ALL USERS (removed !isAdmin check) */}
//         <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowNewOrder(true)}>
//           New Order
//         </Button>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-slate-400 text-sm">Total Orders</p>
//               <p className="text-2xl font-bold text-white">{filteredOrders.length}</p>
//             </div>
//             <ShoppingBag className="w-8 h-8 text-brand-green/50" />
//           </div>
//         </div>
//         <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-slate-400 text-sm">Pending</p>
//               <p className="text-2xl font-bold text-amber-400">{filteredOrders.filter(o => o.status === 'PENDING').length}</p>
//             </div>
//             <Clock className="w-8 h-8 text-amber-400/50" />
//           </div>
//         </div>
//         <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-slate-400 text-sm">Completed</p>
//               <p className="text-2xl font-bold text-emerald-400">{filteredOrders.filter(o => o.status === 'COMPLETED').length}</p>
//             </div>
//             <CheckCircle className="w-8 h-8 text-emerald-400/50" />
//           </div>
//         </div>
//         <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-slate-400 text-sm">Cancelled</p>
//               <p className="text-2xl font-bold text-red-400">{filteredOrders.filter(o => o.status === 'CANCELLED').length}</p>
//             </div>
//             <XCircle className="w-8 h-8 text-red-400/50" />
//           </div>
//         </div>
//       </div>

//       {/* ── NEW ORDER MODAL (ENHANCED) ──────────────────────────────── */}
//       {showNewOrder && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
//           <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
//             {/* Header */}
//             <div className="flex items-center justify-between mb-6">
//               <h3 className="text-lg font-bold text-white">Create New Order</h3>
//               <button 
//                 onClick={() => setShowNewOrder(false)} 
//                 className="text-slate-400 hover:text-white transition-colors"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             {/* Loading State */}
//             {productsLoading && (
//               <div className="flex items-center justify-center py-8">
//                 <Loader className="w-6 h-6 text-brand-green animate-spin mr-3" />
//                 <span className="text-slate-400">Loading products...</span>
//               </div>
//             )}

//             {!productsLoading && (
//               <>
//                 {/* Order Items */}
//                 <div className="space-y-4 mb-6">
//                   {newItems.map((item, idx) => {
//                     const filteredProds = getFilteredProducts(productSearches[idx] || '', idx);
//                     const selectedProduct = products.find(p => p.id === item.productId);
                    
//                     return (
//                       <div key={idx} className="border border-slate-700 rounded-lg p-4 bg-slate-800/30">
//                         <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
//                           {/* Product Selector */}
//                           <div className="md:col-span-2">
//                             <label className="block text-xs font-semibold text-slate-300 mb-2">
//                               Product {idx + 1}
//                             </label>
//                             <div className="relative">
//                               {/* Search/Display Input */}
//                               <div className="relative">
//                                 <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
//                                 <Input
//                                   type="text"
//                                   placeholder="Search by name or category..."
//                                   value={
//                                     selectedProduct 
//                                       ? `${selectedProduct.name} (${selectedProduct.category})`
//                                       : productSearches[idx] || ''
//                                   }
//                                   onChange={(e) => handleProductSearch(idx, e.target.value)}
//                                   onFocus={() => {
//                                     const newDropdowns = [...openDropdowns];
//                                     newDropdowns[idx] = true;
//                                     setOpenDropdowns(newDropdowns);
//                                   }}
//                                   className="pl-10 pr-10"
//                                   readOnly={!!selectedProduct && !productSearches[idx]}
//                                 />
//                                 {selectedProduct && !productSearches[idx] && (
//                                   <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
//                                 )}
//                               </div>

//                               {/* Dropdown Menu */}
//                               {openDropdowns[idx] && filteredProds.length > 0 && (
//                                 <>
//                                   <div 
//                                     className="absolute inset-0 z-40"
//                                     onClick={() => {
//                                       const newDropdowns = [...openDropdowns];
//                                       newDropdowns[idx] = false;
//                                       setOpenDropdowns(newDropdowns);
//                                     }}
//                                   />
//                                   <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
//                                     {filteredProds.map((product) => (
//                                       <button
//                                         key={product.id}
//                                         onClick={() => handleSelectProduct(idx, product)}
//                                         className="w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-b-0"
//                                       >
//                                         <div className="flex items-center justify-between">
//                                           <div>
//                                             <p className="text-sm font-medium text-white">{product.name}</p>
//                                             <p className="text-xs text-slate-400">{product.category}</p>
//                                           </div>
//                                           <p className="text-sm font-semibold text-brand-green">
//                                             {formatCurrency(product.price)}
//                                           </p>
//                                         </div>
//                                       </button>
//                                     ))}
//                                   </div>
//                                 </>
//                               )}

//                               {openDropdowns[idx] && filteredProds.length === 0 && productSearches[idx] && (
//                                 <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg p-4 z-50">
//                                   <p className="text-sm text-slate-400 text-center">No products found</p>
//                                 </div>
//                               )}
//                             </div>

//                             {/* Selected Product Details */}
//                             {selectedProduct && (
//                               <div className="mt-2 p-2 bg-slate-700/30 rounded border border-slate-600">
//                                 <div className="flex items-center justify-between">
//                                   <div>
//                                     <p className="text-xs text-slate-400">Selected</p>
//                                     <p className="text-sm font-medium text-white">{selectedProduct.name}</p>
//                                     <div className="flex gap-2 mt-1">
//                                       <Badge variant="primary" size="sm">{selectedProduct.category}</Badge>
//                                       <span className="text-xs text-brand-green font-semibold">
//                                         {formatCurrency(selectedProduct.price)}
//                                       </span>
//                                     </div>
//                                   </div>
//                                   <button
//                                     onClick={() => {
//                                       const updated = [...newItems];
//                                       updated[idx].productId = '';
//                                       updated[idx].productName = undefined;
//                                       updated[idx].price = undefined;
//                                       updated[idx].category = undefined;
//                                       setNewItems(updated);
//                                       const newSearches = [...productSearches];
//                                       newSearches[idx] = '';
//                                       setProductSearches(newSearches);
//                                     }}
//                                     className="text-slate-400 hover:text-red-400 transition-colors"
//                                   >
//                                     <X className="w-4 h-4" />
//                                   </button>
//                                 </div>
//                               </div>
//                             )}
//                           </div>

//                           {/* Quantity Input */}
//                           <div>
//                             <label className="block text-xs font-semibold text-slate-300 mb-2">
//                               Quantity
//                             </label>
//                             <input
//                               type="number"
//                               min={1}
//                               max={999}
//                               value={item.quantity}
//                               onChange={(e) => {
//                                 const updated = [...newItems];
//                                 updated[idx].quantity = Math.max(1, Number(e.target.value));
//                                 setNewItems(updated);
//                               }}
//                               className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm font-medium hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-green/50"
//                             />
//                           </div>
//                         </div>

//                         {/* Remove Button */}
//                         {newItems.length > 1 && (
//                           <div className="mt-3 flex justify-end">
//                             <button
//                               onClick={() => handleRemoveItem(idx)}
//                               className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors flex items-center gap-1"
//                             >
//                               <X className="w-3 h-3" />
//                               Remove Item
//                             </button>
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>

//                 {/* Add Item Button */}
//                 <Button 
//                   variant="outline" 
//                   size="sm" 
//                   className="w-full mb-6"
//                   onClick={handleAddItem}
//                   leftIcon={<Plus className="w-4 h-4" />}
//                 >
//                   Add Item
//                 </Button>

//                 {/* Action Buttons */}
//                 <div className="flex gap-3">
//                   <Button 
//                     variant="outline" 
//                     className="flex-1" 
//                     onClick={() => setShowNewOrder(false)}
//                   >
//                     Cancel
//                   </Button>
//                   <Button 
//                     className="flex-1" 
//                     isLoading={createStatus === 'loading'}
//                     onClick={handleCreateOrder}
//                   >
//                     Place Order
//                   </Button>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Orders Table */}
//       {loading ? (
//         <SkeletonTable rows={5} />
//       ) : filteredOrders.length === 0 ? (
//         <EmptyState
//           icon={<ShoppingCart className="w-12 h-12 text-slate-600" />}
//           title={statusFilter ? "No matching orders" : "No orders yet"}
//           description={
//             statusFilter
//               ? "Try changing the selected filter."
//               : isAdmin
//               ? "No customer orders exist."
//               : "Place your first order."
//           }
//           action={
//             {
//               label: "New Order",
//               onClick: () => setShowNewOrder(true),
//             }
//           }
//         />
//       ) : (
//         <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
//           <Table
//             data={filteredOrders}
//             columns={[
//               {
//                 key: 'id',
//                 header: 'Order ID',
//                 render: (o: Order) => (
//                   <button
//                     onClick={() => { setSelectedOrder(o); setDrawerOpen(true); }}
//                     className="text-brand-green hover:underline font-mono text-sm"
//                   >
//                     #{o.id}
//                   </button>
//                 ),
//               },
//               {
//                 key: 'userName',
//                 header: 'Customer',
//                 render: (o: Order) => (
//                   <span className="text-white">{o.userName || o.userId}</span>
//                 ),
//               },
//               {
//                 key: 'totalAmount',
//                 header: 'Total',
//                 render: (o: Order) => (
//                   <span className="text-brand-green font-semibold">{formatCurrency(o.totalAmount)}</span>
//                 ),
//               },
//               {
//                 key: 'status',
//                 header: 'Status',
//                 render: (o: Order) => {
//                   const statusColors: Record<string, string> = {
//                     PENDING: 'warning',
//                     COMPLETED: 'success',
//                     CANCELLED: 'danger',
//                   };
//                   return <Badge variant={'warning'}>{o.status}</Badge>;
//                 },
//               },
//               {
//                 key: 'createdAt',
//                 header: 'Date',
//                 render: (o: Order) => <span className="text-slate-400 text-sm">{formatDate(o.createdAt)}</span>,
//               },
//               {
//                 key: 'actions',
//                 header: 'Actions',
//                 render: (o: Order) => (
//                   <div className="flex gap-2">
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={() => { setSelectedOrder(o); setDrawerOpen(true); }}
//                     >
//                       View
//                     </Button>
//                     {isAdmin && o.status === 'PENDING' && (
//                       <>
//                         <Button
//                           size="sm"
//                           onClick={() => { setSelectedOrder(o); setCancelDialogOpen(true); }}
//                           className="text-xs"
//                         >
//                           <Ship className="w-3 h-3 mr-1" />
//                           Ship
//                         </Button>
//                       </>
//                     )}
//                     {/* ✅ ALLOW CANCELLATION FOR BOTH ADMINS AND USERS */}
//                     {o.status === 'PENDING' && (
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         onClick={() => { setSelectedOrder(o); setCancelDialogOpen(true); }}
//                       >
//                         Cancel
//                       </Button>
//                     )}
//                     {isAdmin && (
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         className="text-red-400"
//                         onClick={() => { setSelectedOrder(o); setDeleteDialogOpen(true); }}
//                       >
//                         Delete
//                       </Button>
//                     )}
//                   </div>
//                 ),
//               },
//             ]}
//             keyExtractor={(o) => o.id}
//           />
//         </div>
//       )}

//       {/* Order Details Drawer */}
//       {selectedOrder && (
//         <OrderDetailsDrawer order={selectedOrder} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
//       )}

//       {/* Cancel Order Dialog */}
//       {selectedOrder && (
//         <CancelOrderDialog
//           open={cancelDialogOpen}
//           // order={selectedOrder}
//           loading={dialogLoading}
//           onConfirm={async () => {
//             setDialogLoading(true);
//             try {
//               await dispatch(cancelOrder(selectedOrder.id)).unwrap();
//               success('Order cancelled successfully');
//               setCancelDialogOpen(false);
//             } catch (err) {
//               toastError('Failed to cancel order');
//             } finally {
//               setDialogLoading(false);
//             }
//           }}
//           onCancel={() => setCancelDialogOpen(false)}
//         />
//       )}

//       {/* Delete Order Dialog */}
//       {selectedOrder && (
//         <DeleteOrderDialog
//           open={deleteDialogOpen}
//           // order={selectedOrder}
//           loading={dialogLoading}
//           onConfirm={async () => {
//             setDialogLoading(true);
//             try {
//               await dispatch(deleteAdminOrder(selectedOrder.id)).unwrap();
//               success('Order deleted successfully');
//               setDeleteDialogOpen(false);
//             } catch (err) {
//               toastError('Failed to delete order');
//             } finally {
//               setDialogLoading(false);
//             }
//           }}
//           onCancel={() => setDeleteDialogOpen(false)}
//         />
//       )}
//     </div>
//   );
// }


import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle,
  Clock,
  Eye,
  Loader2,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Truck,
  X,
  XCircle,
} from 'lucide-react';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  cancelOrder,
  clearOrderMessage,
  createOrder,
  deleteAdminOrder,
  deleteOwnOrder,
  fetchOrders,
  updateOrderStatus,
} from '@/features/orders/ordersSlice';
import { ordersService } from '@/features/orders/ordersService';
import { Order } from '@/types';

import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import CancelOrderDialog from '@/components/ui/CancelOrderDialog';
import CustomerFilter from '@/components/ui/CustomerFilter';
import DeleteOrderDialog from '@/components/ui/DeleteOrderDialog';
import OrderDetailsDrawer from '@/components/ui/OrderDetailsDrawer';
import OrderStatusFilter from '@/components/ui/OrderStatusFilter';


type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

interface NewOrderItem {
  productId: string;
  quantity: number;
}

const STATUS_OPTIONS = [
  { value: '', label: 'Select status' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const statusVariant: Record<OrderStatus, 'warning' | 'info' | 'primary' | 'success' | 'error'> = {
  PENDING: 'warning',
  PROCESSING: 'info',
  SHIPPED: 'primary',
  DELIVERED: 'success',
  COMPLETED: 'success',
  CANCELLED: 'error',
};

const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: 'PROCESSING',
  PROCESSING: 'SHIPPED',
  SHIPPED: 'DELIVERED',
  DELIVERED: 'COMPLETED',
};

export default function OrderList() {
  const dispatch = useAppDispatch();
  const { success, error: toastError } = useToast();

  const user = useAppSelector((state) => state.auth.user);
  const orders = useAppSelector((state) => state.orders.items);
  const loading = useAppSelector((state) => state.orders.fetchStatus === 'loading');
  const createStatus = useAppSelector((state) => state.orders.createStatus);
  const updateStatus = useAppSelector((state) => state.orders.updateStatus);
  const message = useAppSelector((state) => state.orders.message);
  const storeError = useAppSelector((state) => state.orders.error);

  const rawRole = user?.rawRole ?? '';

  const isAdmin =
    rawRole === 'ADMIN' ||
    rawRole === 'ADMIN_TYPE2';

  const canCreateOrder = [
    'ADMIN',
    'ADMIN_TYPE2',
    'USER',
    'USER_TYPE2',
  ].includes(rawRole);

  const [showNewOrder, setShowNewOrder] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);

  const [statusFilter, setStatusFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');

  const [newItems, setNewItems] = useState<NewOrderItem[]>([
    { productId: '', quantity: 1 },
  ]);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  useEffect(() => {
    if (!message && !storeError) return;

    if (message) {
      success(message);
    }

    if (storeError) {
      toastError(storeError);
    }

    dispatch(clearOrderMessage());
  }, [message, storeError, dispatch, success, toastError]);

  useEffect(() => {
    if (showNewOrder) {
      }
  }, [showNewOrder]);

  const filteredOrders = useMemo(() => {
    let result = isAdmin
      ? [...orders]
      : orders.filter(
          (order) =>
            order.userId === user?.email ||
            order.userEmail === user?.email ||
            order.userId === user?.id
        );

    if (statusFilter) {
      result = result.filter((order) => order.status === statusFilter);
    }

    if (customerFilter.trim()) {
      const search = customerFilter.trim().toLowerCase();

      result = result.filter(
        (order) =>
          order.userEmail?.toLowerCase().includes(search) ||
          order.userName?.toLowerCase().includes(search)
      );
    }

    return result;
  }, [orders, isAdmin, user, statusFilter, customerFilter]);

  const resetNewOrderForm = () => {
    setNewItems([{ productId: '', quantity: 1 }]);
  };

  const closeNewOrder = () => {
    setShowNewOrder(false);
    resetNewOrderForm();
  };

  const handleCreateOrder = async () => {
    const validItems = newItems.filter((item) => item.productId.trim());

    if (!validItems.length) {
      toastError('Please select at least one product.');
      return;
    }

    if (validItems.some((item) => item.quantity < 1)) {
      toastError('Quantity must be at least 1.');
      return;
    }

    try {
      await dispatch(
        createOrder({
          items: validItems,
        })
      ).unwrap();

      closeNewOrder();
    } catch {
      // Redux error is displayed by the toast effect.
    }
  };

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);

    try {
      const latestOrder = await ordersService.getOrder(order.id);
      setSelectedOrder(latestOrder);
    } catch (error) {
      toastError(
        error instanceof Error
          ? error.message
          : 'Unable to load order details'
      );
    }
  };

  const handleStatusChange = async (order: Order, status: string) => {
    if (!status || status === order.status) return;

    try {
      await dispatch(
        updateOrderStatus({
          id: order.id,
          status: status as Order['status'],
        })
      ).unwrap();
    } catch {
      // Redux error is displayed by the toast effect.
    }
  };

  const handleAdvanceStatus = async (order: Order) => {
    const status = nextStatus[order.status as OrderStatus];

    if (!status) return;

    await handleStatusChange(order, status);
  };

  const handleCancelConfirm = async () => {
    if (!selectedOrder) return;

    setDialogLoading(true);

    try {
      await dispatch(cancelOrder(selectedOrder.id)).unwrap();
      setCancelDialogOpen(false);
      setSelectedOrder(null);
    } catch {
      // Redux error is displayed by the toast effect.
    } finally {
      setDialogLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedOrder) return;

    setDialogLoading(true);

    try {
      if (isAdmin) {
        await dispatch(deleteAdminOrder(selectedOrder.id)).unwrap();
      } else {
        await dispatch(deleteOwnOrder(selectedOrder.id)).unwrap();
      }

      setDeleteDialogOpen(false);
      setSelectedOrder(null);
    } catch {
      // Redux error is displayed by the toast effect.
    } finally {
      setDialogLoading(false);
    }
  };

  const handleAddItem = () => {
    setNewItems((current) => [
      ...current,
      { productId: '', quantity: 1 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setNewItems((current) =>
      current.length === 1
        ? current
        : current.filter((_, rowIndex) => rowIndex !== index)
    );
  };

  const stats = {
    total: filteredOrders.length,
    pending: filteredOrders.filter((o) => o.status === 'PENDING').length,
    completed: filteredOrders.filter(
      (o) => o.status === 'COMPLETED'
    ).length,
    cancelled: filteredOrders.filter(
      (o) => o.status === 'CANCELLED'
    ).length,
  };

  return (
    <div className="space-y-8 page-enter">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Orders' },
        ]}
      />

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Orders
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {isAdmin
              ? 'Manage customer orders and order status.'
              : 'View and manage your orders.'}
          </p>
        </div>

        {canCreateOrder && (
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowNewOrder(true)}
          >
            New Order
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Total Orders
          </p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            <ShoppingBag className="w-7 h-7 text-brand-green/60" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Pending
          </p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-2xl font-bold text-amber-500">{stats.pending}</p>
            <Clock className="w-7 h-7 text-amber-400/60" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Completed
          </p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-2xl font-bold text-emerald-500">
              {stats.completed}
            </p>
            <CheckCircle className="w-7 h-7 text-emerald-400/60" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Cancelled
          </p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-2xl font-bold text-red-500">
              {stats.cancelled}
            </p>
            <XCircle className="w-7 h-7 text-red-400/60" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <OrderStatusFilter
            value={statusFilter}
            onChange={setStatusFilter}
          />

          {isAdmin && (
            <CustomerFilter
              value={customerFilter}
              onChange={setCustomerFilter}
            />
          )}
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 flex justify-center">
          <Loader2 className="w-7 h-7 text-brand-green animate-spin" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart className="w-12 h-12 text-slate-300" />}
          title={statusFilter || customerFilter ? 'No matching orders' : 'No orders yet'}
          description={
            statusFilter || customerFilter
              ? 'Try changing your filters.'
              : isAdmin
              ? 'No customer orders exist.'
              : 'Place your first order.'
          }
          action={
            canCreateOrder
              ? {
                  label: 'New Order',
                  onClick: () => setShowNewOrder(true),
                  icon: <Plus className="w-4 h-4" />,
                }
              : undefined
          }
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <Table
            data={filteredOrders}
            bordered
            columns={[
              {
                key: 'id',
                header: 'Order ID',
                sortable: true,
                render: (order: Order) => (
                  <button
                    type="button"
                    onClick={() => handleViewOrder(order)}
                    className="font-mono text-sm font-semibold text-brand-green hover:underline"
                  >
                    #{order.id}
                  </button>
                ),
              },
              {
                key: 'userName',
                header: 'Customer',
                render: (order: Order) => (
                  <div>
                    <p className="font-semibold text-slate-800">
                      {order.userName || 'Customer'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {order.userEmail || order.userId}
                    </p>
                  </div>
                ),
              },
              {
                key: 'totalAmount',
                header: 'Total',
                sortable: true,
                render: (order: Order) => (
                  <span className="font-semibold text-slate-800">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(order.totalAmount)}
                  </span>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                render: (order: Order) => (
                  <Badge
                    variant={
                      statusVariant[order.status as OrderStatus] ?? 'default'
                    }
                  >
                    {order.status}
                  </Badge>
                ),
              },
              {
                key: 'createdAt',
                header: 'Date',
                sortable: true,
                render: (order: Order) => (
                  <span className="text-sm text-slate-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </span>
                ),
              },
              {
                key: 'actions',
                header: 'Actions',
                render: (order: Order) => {
                  const next = nextStatus[order.status as OrderStatus];

                  return (
                    <div
                      className="flex flex-wrap gap-2 min-w-[260px]"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewOrder(order)}
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                      >
                        View
                      </Button>

                      {isAdmin && next && (
                        <Button
                          size="sm"
                          onClick={() => handleAdvanceStatus(order)}
                          isLoading={updateStatus === 'loading'}
                          leftIcon={<Truck className="w-3.5 h-3.5" />}
                        >
                          {next === 'PROCESSING'
                            ? 'Process'
                            : next === 'SHIPPED'
                            ? 'Ship'
                            : next === 'DELIVERED'
                            ? 'Deliver'
                            : 'Complete'}
                        </Button>
                      )}

                      {isAdmin && (
                        <Select
                          aria-label={`Change status for order ${order.id}`}
                          options={STATUS_OPTIONS}
                          value=""
                          onChange={(event) =>
                            handleStatusChange(order, event.target.value)
                          }
                          className="w-40"
                        />
                      )}

                      {order.status === 'PENDING' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedOrder(order);
                            setCancelDialogOpen(true);
                          }}
                        >
                          Cancel
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => {
                          setSelectedOrder(order);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  );
                },
              },
            ]}
            keyExtractor={(order) => order.id}
          />
        </div>
      )}

      {showNewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Create New Order
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Enter product IDs and quantities.
                </p>
              </div>

              <button
                type="button"
                onClick={closeNewOrder}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                <p className="text-sm font-medium text-blue-800">
                  Enter the product ID used by the product service.
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  The order API accepts product IDs and quantities directly.
                </p>
              </div>

                  {newItems.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <Input
                        label={`Product ID ${index + 1}`}
                        value={item.productId}
                        onChange={(event) => {
                          const value = event.target.value;
                          setNewItems((current) =>
                            current.map((row, rowIndex) =>
                              rowIndex === index
                                ? { ...row, productId: value }
                                : row
                            )
                          );
                        }}
                        placeholder="Product ID"
                      />

                      <Input
                        label="Quantity"
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(event) => {
                          const quantity = Math.max(
                            1,
                            Number(event.target.value) || 1
                          );

                          setNewItems((current) =>
                            current.map((row, rowIndex) =>
                              rowIndex === index
                                ? { ...row, quantity }
                                : row
                            )
                          );
                        }}
                      />

                      {newItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="sm:col-span-2 flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
                        >
                          <X className="w-3.5 h-3.5" />
                          Remove item
                        </button>
                      )}
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddItem}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Add Item
                  </Button>

                  <div className="flex flex-col-reverse sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={closeNewOrder}
                    >
                      Cancel
                    </Button>

                    <Button
                      className="flex-1"
                      isLoading={createStatus === 'loading'}
                      onClick={handleCreateOrder}
                    >
                      Place Order
                    </Button>
                  </div>
            </div>
          </div>
        </div>
      )}

      {selectedOrder && (
        <OrderDetailsDrawer
          order={selectedOrder}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
      )}

      {selectedOrder && (
        <CancelOrderDialog
          open={cancelDialogOpen}
          loading={dialogLoading}
          onConfirm={handleCancelConfirm}
          onCancel={() => setCancelDialogOpen(false)}
        />
      )}

      {selectedOrder && (
        <DeleteOrderDialog
          open={deleteDialogOpen}
          loading={dialogLoading}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteDialogOpen(false)}
        />
      )}
    </div>
  );
}
