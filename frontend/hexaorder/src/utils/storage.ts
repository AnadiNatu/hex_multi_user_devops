
type StorageType = 'local' | 'session';

class StorageService {
  private prefix: string = 'hexaorder_';

  //Get storage instance based on type
  private getStorage(type: StorageType): Storage {
    return type === 'local' ? localStorage : sessionStorage;
  }

  //Get prefixed key
  private getPrefixedKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  //Set item in storage
  set<T>(key: string, value: T, type: StorageType = 'local'): boolean {
    try {
      const storage = this.getStorage(type);
      const prefixedKey = this.getPrefixedKey(key);
      const serializedValue = JSON.stringify(value);
      storage.setItem(prefixedKey, serializedValue);
      return true;
    } catch (error) {
      console.error(`Error setting storage item "${key}":`, error);
      return false;
    }
  }

  //Get item from storage
  get<T>(key: string, type: StorageType = 'local'): T | null {
    try {
      const storage = this.getStorage(type);
      const prefixedKey = this.getPrefixedKey(key);
      const item = storage.getItem(prefixedKey);

      if (item === null) return null;

      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error getting storage item "${key}":`, error);
      return null;
    }
  }

  //Remove item from storage
  remove(key: string, type: StorageType = 'local'): boolean {
    try {
      const storage = this.getStorage(type);
      const prefixedKey = this.getPrefixedKey(key);
      storage.removeItem(prefixedKey);
      return true;
    } catch (error) {
      console.error(`Error removing storage item "${key}":`, error);
      return false;
    }
  }

  //Clear all items with prefix
  clear(type: StorageType = 'local'): boolean {
    try {
      const storage = this.getStorage(type);
      const keys = Object.keys(storage);

      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          storage.removeItem(key);
        }
      });

      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  //Check if key exists
  has(key: string, type: StorageType = 'local'): boolean {
    const storage = this.getStorage(type);
    const prefixedKey = this.getPrefixedKey(key);
    return storage.getItem(prefixedKey) !== null;
  }

  //Get all keys with prefix
  keys(type: StorageType = 'local'): string[] {
    const storage = this.getStorage(type);
    const allKeys = Object.keys(storage);

    return allKeys
      .filter((key) => key.startsWith(this.prefix))
      .map((key) => key.replace(this.prefix, ''));
  }

  //Get storage size in bytes
  getSize(type: StorageType = 'local'): number {
    const storage = this.getStorage(type);
    let size = 0;

    Object.keys(storage).forEach((key) => {
      if (key.startsWith(this.prefix)) {
        const item = storage.getItem(key);
        if (item) {
          size += item.length + key.length;
        }
      }
    });

    return size;
  }

  //Get remaining storage capacity (approximate)
  getRemainingCapacity(type: StorageType = 'local'): number {
    const storage = this.getStorage(type);
    const maxSize = 5 * 1024 * 1024; // 5MB (typical localStorage limit)
    
    try {
      const testKey = `${this.prefix}__test__`;
      let currentSize = 0;

      // Calculate current size
      Object.keys(storage).forEach((key) => {
        const item = storage.getItem(key);
        if (item) {
          currentSize += item.length + key.length;
        }
      });

      return maxSize - currentSize;
    } catch (error) {
      console.error('Error calculating remaining capacity:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const storage = new StorageService();

// Export specific storage keys for type safety
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER: 'user',
  THEME: 'theme',
  SIDEBAR_STATE: 'sidebar_state',
  RECENT_SEARCHES: 'recent_searches',
  CART: 'cart',
  PREFERENCES: 'preferences',
} as const;

// Utility functions for common storage operations
export const authStorage = {
  setToken: (token: string) => storage.set(STORAGE_KEYS.AUTH_TOKEN, token),
  getToken: () => storage.get<string>(STORAGE_KEYS.AUTH_TOKEN),
  removeToken: () => storage.remove(STORAGE_KEYS.AUTH_TOKEN),
  
  setUser: (user: any) => storage.set(STORAGE_KEYS.USER, user),
  getUser: () => storage.get<any>(STORAGE_KEYS.USER),
  removeUser: () => storage.remove(STORAGE_KEYS.USER),
  
  clearAuth: () => {
    storage.remove(STORAGE_KEYS.AUTH_TOKEN);
    storage.remove(STORAGE_KEYS.USER);
  },
};

export const themeStorage = {
  set: (theme: 'light' | 'dark') => storage.set(STORAGE_KEYS.THEME, theme),
  get: () => storage.get<'light' | 'dark'>(STORAGE_KEYS.THEME) || 'light',
};

export const sidebarStorage = {
  set: (isOpen: boolean) => storage.set(STORAGE_KEYS.SIDEBAR_STATE, isOpen),
  get: () => storage.get<boolean>(STORAGE_KEYS.SIDEBAR_STATE) ?? true,
};

export const cartStorage = {
  set: (cart: any[]) => storage.set(STORAGE_KEYS.CART, cart),
  get: () => storage.get<any[]>(STORAGE_KEYS.CART) || [],
  clear: () => storage.remove(STORAGE_KEYS.CART),
  
  addItem: (item: any) => {
    const cart = cartStorage.get();
    cart.push(item);
    cartStorage.set(cart);
  },
  
  removeItem: (itemId: string) => {
    const cart = cartStorage.get();
    const filtered = cart.filter((item) => item.id !== itemId);
    cartStorage.set(filtered);
  },
  
  updateQuantity: (itemId: string, quantity: number) => {
    const cart = cartStorage.get();
    const updated = cart.map((item) =>
      item.id === itemId ? { ...item, quantity } : item
    );
    cartStorage.set(updated);
  },
};

export const preferencesStorage = {
  set: (preferences: Record<string, any>) =>
    storage.set(STORAGE_KEYS.PREFERENCES, preferences),
  get: () => storage.get<Record<string, any>>(STORAGE_KEYS.PREFERENCES) || {},
  
  update: (key: string, value: any) => {
    const prefs = preferencesStorage.get();
    prefs[key] = value;
    preferencesStorage.set(prefs);
  },
  
  getPreference: (key: string, defaultValue: any = null) => {
    const prefs = preferencesStorage.get();
    return prefs[key] ?? defaultValue;
  },
};