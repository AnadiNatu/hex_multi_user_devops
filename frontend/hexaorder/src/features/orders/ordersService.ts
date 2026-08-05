
import { API_ENDPOINTS, apiService } from "@/services/apiService";
import { Order } from "@/types";

function mapBackendOrder(o: any): Order {
  return {
    id:          String(o.id),
    userId:      o.userId || o.userEmail || o.email || '',
    userName:    o.userName || o.userEmail || '',
    items: (o.items || []).map((item: any) => ({
      id:          String(item.id),
      productId:   String(item.productId),
      productName: item.productName || `Product #${item.productId}`,
      quantity:    item.quantity,
      price:       typeof item.price    === 'string' ? parseFloat(item.price)    : (item.price    ?? 0),
      subtotal: typeof item.subtotal === 'string'? parseFloat(item.subtotal) : (item.subtotal ?? (item.price * item.quantity)),
    })),
    totalAmount: typeof o.totalAmount === 'string' ? parseFloat(o.totalAmount) : (o.totalAmount ?? 0),
    status:      o.status as Order['status'],
    createdAt:   o.createdAt || new Date().toISOString(),
    updatedAt:   o.updatedAt || new Date().toISOString(),
    userEmail : o.userEmail 
  };
}

export const ordersService = {
  getOrders: async (rawRole?: string): Promise<Order[]> => {
    const adminRoles = ['ADMIN', 'ADMIN_TYPE1', 'ADMIN_TYPE2'];
    const isAdmin    = rawRole && adminRoles.includes(rawRole);
    const endpoint   = isAdmin ? API_ENDPOINTS.ORDERS_ADMIN_ALL : API_ENDPOINTS.ORDERS_MY;
    try {
      const json = await apiService.get<any>(endpoint);
      const list: any[] = json.orders ?? json;
      if (!Array.isArray(list)) return [];
      return list.map(mapBackendOrder);
    } catch (err: any) {
      // Orders API not yet seeded — return empty list gracefully
      if (err.message?.includes('404') || err.message?.includes('500')) return [];
      throw err;
    }
  },

  createOrder: async (
    payload: { items: Array<{ productId: string; quantity: number }> }
  ): Promise<Order> => {
    const backendPayload = {
      items: payload.items.map((i) => ({
        productId: Number(i.productId),
        quantity:  i.quantity,
      })),
    };
    const json = await apiService.post<any>(API_ENDPOINTS.ORDERS_CREATE, backendPayload);
    return mapBackendOrder(json.order ?? json);
  },

  updateOrderStatus: async (id: string, status: Order['status']): Promise<Order> => {
    const json = await apiService.put<any>(
      `${API_ENDPOINTS.ORDER_STATUS(id)}?status=${status}`
    );
    return mapBackendOrder(json.order ?? json);
  },

  cancelOrder: async (id: string): Promise<Order> => {

    const json = await apiService.put<any>(API_ENDPOINTS.ORDER_CANCEL(id));

    return mapBackendOrder(json.order ?? json);
},

deleteOwnOrder: async (id: string): Promise<void> => {
    await apiService.delete(API_ENDPOINTS.ORDER_DELETE_SELF(id));
},

deleteAdminOrder : async (id : string) : Promise<void> => {
  await apiService.delete(API_ENDPOINTS.ORDER_DELETE_ADMIN(id))
},

getOrder: async (id: string): Promise<Order> => {
    const json = await apiService.get<any>(API_ENDPOINTS.ORDER_DETAIL(id));
    return mapBackendOrder(json.order ?? json);
},

getOrdersByStatus: async (status: string): Promise<Order[]> => {
    const json = await apiService.get<any>(API_ENDPOINTS.ORDER_BY_STATUS(status));

    const list =json.orders ?? json;

    return list.map(mapBackendOrder);
},

getOrdersByCustomer: async (email: string): Promise<Order[]> => {

    const json = await apiService.get<any>(API_ENDPOINTS.ORDER_BY_CUSTOMER(email));

    const list =json.orders ?? json;

    return list.map(mapBackendOrder);
},


};