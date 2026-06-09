import { apiService, API_ENDPOINTS } from '@/services/apiService';
import { Product, BackendProduct, ProductFormData } from '../../types';

// Mapper 
export function mapBackendProduct(p: BackendProduct | any): Product {
  return {
    id: String(p.id),
    name: p.name,
    description: p.description,
    price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
    stock: p.stockQuantity ?? p.stock ?? 0,
    category: p.category,
    image: p.imageUrl || p.image || '',
    isActive: p.isActive ?? true,
    createdAt: p.createdAt || new Date().toISOString(),
    updatedAt: p.updatedAt || new Date().toISOString(),
    createdBy: p.createdBy,
    updatedBy: p.updatedBy,
  };
}

function mapProductList(json: any): Product[] {
  const raw: any[] = json.products || json;
  if (!Array.isArray(raw)) return [];
  return raw.map(mapBackendProduct);
}

// Service 
export const productsService = {
  /**
   * Get products — endpoint varies by role.
   *
   * ADMIN              → /product/admin/all       (returns wrapper + statistics)
   * ADMIN_TYPE1        → /product/admin/all       (same admin view)
   * ADMIN_TYPE2        → /product/admin/all       (same admin view)
   * USER               → /product/user/search?keyword=
   * USER_TYPE1         → /product/user-type1/categories then featured as fallback;
   *                      for the full list we use /product/user-type1/featured
   *                      combined with category search — simplest: reuse user search
   *                      NOTE: USER_TYPE1 does NOT have /product/user/search access,
   *                      so we call /product/user-type1/featured for the initial list.
   * USER_TYPE2         → /product/user-type2/sorted?order=asc  (default sorted list)
   */
  getProducts: async (rawRole?: string): Promise<{ products: Product[]; statistics?: any }> => {
    const adminRoles = ['ADMIN', 'ADMIN_TYPE1', 'ADMIN_TYPE2'];
    const isAdmin = rawRole && adminRoles.includes(rawRole);

    if (isAdmin) {
      const json = await apiService.get<any>(API_ENDPOINTS.PRODUCT_ADMIN_ALL);
      return {
        products: mapProductList(json),
        statistics: json.statistics,
      };
    }

    if (rawRole === 'USER_TYPE1') {
      // USER_TYPE1 uses /product/user-type1/featured for homepage listing
      const json = await apiService.get<any>(API_ENDPOINTS.PRODUCT_UT1_FEATURED);
      return { products: mapProductList(json) };
    }

    if (rawRole === 'USER_TYPE2') {
      // USER_TYPE2 uses sorted endpoint as their default product list
      const json = await apiService.get<any>(`${API_ENDPOINTS.PRODUCT_UT2_SORTED}?order=asc`);
      return { products: mapProductList(json) };
    }

    // USER (basic) — keyword search with empty string returns all active
    const json = await apiService.get<any>(`${API_ENDPOINTS.PRODUCT_USER_SEARCH}?keyword=`);
    return { products: mapProductList(json) };
  },

  /**
   * Search products by keyword.
   * USER               → /product/user/search?keyword=
   * USER_TYPE1         → /product/user-type1/category (no keyword search endpoint,
   *                      fallback: filter client-side from featured list)
   * USER_TYPE2         → /product/user-type2/sorted (no keyword endpoint,
   *                      filter client-side)
   * ADMIN*             → /product/admin/all then filter client-side
   */
  searchProducts: async (keyword: string, rawRole?: string): Promise<Product[]> => {
    const adminRoles = ['ADMIN', 'ADMIN_TYPE1', 'ADMIN_TYPE2'];

    if (rawRole && adminRoles.includes(rawRole)) {
      // Admin: get all and filter client-side (backend has no admin search endpoint)
      const json = await apiService.get<any>(API_ENDPOINTS.PRODUCT_ADMIN_ALL);
      const all = mapProductList(json);
      return all.filter(
        (p) =>
          p.name.toLowerCase().includes(keyword.toLowerCase()) ||
          (p.description || '').toLowerCase().includes(keyword.toLowerCase())
      );
    }

    if (rawRole === 'USER_TYPE1' || rawRole === 'USER_TYPE2') {
      // These roles have no keyword search endpoint — filter from their default list
      const { products } = await productsService.getProducts(rawRole);
      return products.filter(
        (p) =>
          p.name.toLowerCase().includes(keyword.toLowerCase()) ||
          (p.description || '').toLowerCase().includes(keyword.toLowerCase())
      );
    }

    // USER (basic) — direct keyword search
    const json = await apiService.get<any>(
      `${API_ENDPOINTS.PRODUCT_USER_SEARCH}?keyword=${encodeURIComponent(keyword)}`
    );
    return mapProductList(json);
  },

  //Get product by id.
   // All roles  /product/user/details/{id} 
  getProductById: async (id: string): Promise<Product> => {
    const json = await apiService.get<BackendProduct>(API_ENDPOINTS.PRODUCT_USER_DETAILS(id));
    return mapBackendProduct(json);
  },

  //Create product — POST /product/admin/create (multipart, ADMIN only)
  createProduct: async (formData: ProductFormData, imageFile?: File | null): Promise<Product> => {
    const fd = new FormData();
    fd.append(
      'product',
      JSON.stringify({
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stockQuantity: formData.stock,   // frontend uses 'stock', backend expects 'stockQuantity'
        category: formData.category,
        isActive: formData.isActive ?? true,
      })
    );
    if (imageFile) {
      fd.append('image', imageFile);
    }

    const json = await apiService.upload<any>(API_ENDPOINTS.PRODUCT_ADMIN_CREATE, fd, 'POST');
    return mapBackendProduct(json.product || json);
  },

  //Update product — PUT /product/admin-type2/update-price/{id} (multipart)
   
  updateProduct: async (
    id: string,
    formData: ProductFormData,
    imageFile?: File | null
  ): Promise<Product> => {
    const fd = new FormData();
    fd.append(
      'product',
      JSON.stringify({
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stockQuantity: formData.stock,   // map stock → stockQuantity
        category: formData.category,
        isActive: formData.isActive ?? true,
      })
    );
    if (imageFile) {
      fd.append('image', imageFile);
    }

    const json = await apiService.upload<any>(
      API_ENDPOINTS.PRODUCT_AT2_UPDATE_PRICE(id),
      fd,
      'PUT'
    );
    return mapBackendProduct(json.product || json);
  },

  //Delete product — DELETE /product/admin/delete/{id}
  deleteProduct: async (id: string): Promise<void> => {
    await apiService.delete(API_ENDPOINTS.PRODUCT_ADMIN_DELETE(id));
  },

   //Get products by category.
   //ADMIN_TYPE2 → /product/admin-type2/category/{category}
   //USER_TYPE1  → /product/user-type1/category/{category}
  getProductsByCategory: async (category: string, rawRole?: string): Promise<Product[]> => {
    const adminType2Roles = ['ADMIN', 'ADMIN_TYPE2'];
    const adminType1Roles = ['ADMIN_TYPE1'];

    let endpoint: string;

    if (rawRole && adminType2Roles.includes(rawRole)) {
      endpoint = API_ENDPOINTS.PRODUCT_AT2_CATEGORY(category);
    } else if (rawRole && adminType1Roles.includes(rawRole)) {
      // ADMIN_TYPE1 doesn't have a category endpoint — use admin-type2 category view
      endpoint = API_ENDPOINTS.PRODUCT_AT2_CATEGORY(category);
    } else if (rawRole === 'USER_TYPE1') {
      endpoint = API_ENDPOINTS.PRODUCT_UT1_CATEGORY(category);
    } else {
      // USER / USER_TYPE2 — filter from their list client-side
      const { products } = await productsService.getProducts(rawRole);
      return products.filter((p) => p.category === category);
    }

    const json = await apiService.get<any>(endpoint);
    return mapProductList(json);
  },

  //Get all categories — /product/user-type1/categories
  getCategories: async (): Promise<{ categories: string[]; categoryCounts: Record<string, number> }> => {
    const json = await apiService.get<any>(API_ENDPOINTS.PRODUCT_UT1_CATEGORIES);
    return {
      categories: json.categories || [],
      categoryCounts: json.categoryCounts || {},
    };
  },

  //Get featured products — /product/user-type1/featured
  getFeaturedProducts: async (): Promise<Product[]> => {
    const json = await apiService.get<any>(API_ENDPOINTS.PRODUCT_UT1_FEATURED);
    return mapProductList(json);
  },

  //Products by price range — /product/user-type2/price-range
  getProductsByPriceRange: async (minPrice: number, maxPrice: number): Promise<Product[]> => {
    const json = await apiService.get<any>(
      `${API_ENDPOINTS.PRODUCT_UT2_PRICE_RANGE}?minPrice=${minPrice}&maxPrice=${maxPrice}`
    );
    return mapProductList(json);
  },

  //Products sorted by price — /product/user-type2/sorted
  getProductsSortedByPrice: async (order: 'asc' | 'desc' = 'asc'): Promise<Product[]> => {
    const json = await apiService.get<any>(`${API_ENDPOINTS.PRODUCT_UT2_SORTED}?order=${order}`);
    return mapProductList(json);
  },

  //Compare products — /product/user-type2/compare
  compareProducts: async (ids: string[]): Promise<Product[]> => {
    const numericIds = ids.map(Number);
    const json = await apiService.post<any>(API_ENDPOINTS.PRODUCT_UT2_COMPARE, numericIds);
    return mapProductList(json);
  },

  //Update stock — /product/admin-type1/update-stock/{id}?quantity=N
  updateStock: async (id: string, quantity: number): Promise<Product> => {
    const json = await apiService.put<any>(
      `${API_ENDPOINTS.PRODUCT_AT1_UPDATE_STOCK(id)}?quantity=${quantity}`
    );
    return mapBackendProduct(json.product || json);
  },

  //Toggle active/inactive — /product/admin-type2/toggle-active/{id}
  toggleActive: async (id: string): Promise<Product> => {
    const json = await apiService.patch<any>(API_ENDPOINTS.PRODUCT_AT2_TOGGLE_ACTIVE(id));
    return mapBackendProduct(json.product || json);
  },

  //Low stock products — /product/admin-type1/low-stock
  getLowStockProducts: async (threshold = 10): Promise<Product[]> => {
    const json = await apiService.get<any>(
      `${API_ENDPOINTS.PRODUCT_AT1_LOW_STOCK}?threshold=${threshold}`
    );
    return mapProductList(json);
  },
};