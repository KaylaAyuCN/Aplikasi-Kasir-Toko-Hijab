import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Transaction, CartItem } from '../types';
import { INITIAL_PRODUCTS, INITIAL_TRANSACTIONS } from '../data/initialData';
import { generateInvoiceNumber } from '../utils/formatters';
import {
  getInitialProducts,
  persistProducts,
  getInitialTransactions,
  persistTransactions,
  getItemDB,
  STORAGE_KEYS,
} from '../utils/storage';

interface StoreContextType {
  products: Product[];
  transactions: Transaction[];
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => boolean;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  checkoutTransaction: (payAmount: number, paymentMethod?: string) => Transaction | null;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  resetToInitialData: () => void;
  importProducts: (importedList: Product[]) => boolean;
  exportProductsJson: () => string;
  activeReceipt: Transaction | null;
  setActiveReceipt: (trx: Transaction | null) => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Inisialisasi awal produk dari localStorage (atau migrasi dari key lama)
  const [products, setProducts] = useState<Product[]>(() => getInitialProducts());

  // 2. Inisialisasi transaksi dari penyimpanan
  const [transactions, setTransactions] = useState<Transaction[]>(() => getInitialTransactions());

  // 3. Hydrate dari IndexedDB saat pertama kali dimuat.
  // IndexedDB menampung data foto beresolusi tinggi tanpa batasan 5MB localStorage,
  // menjamin foto tetap utuh setelah reload di Vercel maupun perangkat mobile.
  useEffect(() => {
    getItemDB<Product[]>(STORAGE_KEYS.PRODUCTS).then((dbProducts) => {
      if (dbProducts && Array.isArray(dbProducts) && dbProducts.length > 0) {
        setProducts(dbProducts);
      }
    });

    getItemDB<Transaction[]>(STORAGE_KEYS.TRANSACTIONS).then((dbTrx) => {
      if (dbTrx && Array.isArray(dbTrx) && dbTrx.length > 0) {
        setTransactions(dbTrx);
      }
    });
  }, []);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART) || localStorage.getItem('pulchra_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active receipt modal
  const [activeReceipt, setActiveReceipt] = useState<Transaction | null>(null);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(
    null
  );

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Simpan produk ke dual-layer (IndexedDB + localStorage) setiap kali state berubah
  useEffect(() => {
    persistProducts(products);
  }, [products]);

  // Simpan riwayat transaksi ke IndexedDB & localStorage
  useEffect(() => {
    persistTransactions(transactions);
  }, [transactions]);

  // Simpan keranjang ke localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
      localStorage.removeItem('pulchra_cart');
    } catch (e) {
      console.error('Failed saving cart to localStorage', e);
    }
  }, [cart]);

  // Add product to cart with stock validation
  const addToCart = (product: Product, quantity = 1): boolean => {
    if (product.stock <= 0) {
      showToast(`Stok ${product.name} sudah habis!`, 'error');
      return false;
    }

    const existingIndex = cart.findIndex((item) => item.product.id === product.id);

    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].quantity;
      const newQty = currentQty + quantity;

      if (newQty > product.stock) {
        showToast(`Jumlah melebihi stok yang ada (sisa ${product.stock} pcs)!`, 'error');
        return false;
      }

      setCart((prev) =>
        prev.map((item, idx) => (idx === existingIndex ? { ...item, quantity: newQty } : item))
      );
      showToast(`${product.name} (+${quantity}) ditambahkan ke keranjang`, 'success');
      return true;
    }

    if (quantity > product.stock) {
      showToast(`Jumlah melebihi stok yang ada (sisa ${product.stock} pcs)!`, 'error');
      return false;
    }

    setCart((prev) => [...prev, { product, quantity }]);
    showToast(`${product.name} dimasukkan ke keranjang`, 'success');
    return true;
  };

  // Update quantity in cart
  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const currentProduct = products.find((p) => p.id === productId);
    const maxStock = currentProduct ? currentProduct.stock : 999;

    if (quantity > maxStock) {
      showToast(`Maksimal stok tersedia hanya ${maxStock} pcs`, 'error');
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Remove item from cart
  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
  };

  // Checkout transaction
  const checkoutTransaction = (payAmount: number, paymentMethod = 'Tunai'): Transaction | null => {
    if (cart.length === 0) {
      showToast('Keranjang belanja masih kosong!', 'error');
      return null;
    }

    // Verify stock availability
    for (const item of cart) {
      const prod = products.find((p) => p.id === item.product.id);
      if (!prod || prod.stock < item.quantity) {
        showToast(
          `Transaksi gagal: Stok ${item.product.name} tidak cukup (sisa ${prod?.stock ?? 0} pcs)!`,
          'error'
        );
        return null;
      }
    }

    const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    if (payAmount < totalAmount) {
      showToast('Jumlah uang yang dibayarkan kurang dari total belanja!', 'error');
      return null;
    }

    const changeAmount = payAmount - totalAmount;
    const invoiceNumber = generateInvoiceNumber(transactions.length + 1);

    const transactionItems = cart.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      target: item.product.target,
      price: item.product.price,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity,
    }));

    const newTransaction: Transaction = {
      id: `TRX-${Date.now()}`,
      invoiceNumber,
      date: new Date().toISOString(),
      items: transactionItems,
      totalAmount,
      payAmount,
      changeAmount,
      cashierName: 'Kasir Pulchra',
      paymentMethod,
    };

    // 1. Deduct stock automatically
    setProducts((prev) =>
      prev.map((prod) => {
        const cartItem = cart.find((c) => c.product.id === prod.id);
        if (!cartItem) return prod;
        return {
          ...prod,
          stock: Math.max(0, prod.stock - cartItem.quantity),
        };
      })
    );

    // 2. Save transaction to history
    setTransactions((prev) => [newTransaction, ...prev]);

    // 3. Clear cart
    clearCart();

    // 4. Show receipt modal
    setActiveReceipt(newTransaction);
    showToast(`Transaksi ${invoiceNumber} berhasil diselesaikan!`, 'success');

    return newTransaction;
  };

  // Add new product
  const addProduct = (productData: Omit<Product, 'id'>) => {
    const id = `PRD-${Date.now().toString().slice(-4)}`;
    const newProd: Product = {
      ...productData,
      id,
    };
    setProducts((prev) => [newProd, ...prev]);
    showToast(`Produk "${newProd.name}" berhasil ditambahkan!`, 'success');
  };

  // Update existing product
  const updateProduct = (updatedProduct: Product) => {
    const updatedList = products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
    setProducts(updatedList);
    persistProducts(updatedList);

    // Sinkronkan thumbnail foto di keranjang jika produk tersebut ada di keranjang
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === updatedProduct.id
          ? { ...item, product: updatedProduct }
          : item
      )
    );
    showToast(`Produk "${updatedProduct.name}" berhasil diperbarui`, 'success');
  };

  // Delete product
  const deleteProduct = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    const updatedList = products.filter((p) => p.id !== productId);
    setProducts(updatedList);
    persistProducts(updatedList);
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast(`Produk "${prod?.name || ''}" telah dihapus`, 'info');
  };

  // Reset to initial demo data
  const resetToInitialData = () => {
    setProducts(INITIAL_PRODUCTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setCart([]);
    persistProducts(INITIAL_PRODUCTS);
    persistTransactions(INITIAL_TRANSACTIONS);
    showToast('Data aplikasi berhasil dikembalikan ke data awal', 'info');
  };

  // Ekspor seluruh katalog produk (termasuk foto) ke file JSON
  const exportProductsJson = (): string => {
    return JSON.stringify(products, null, 2);
  };

  // Impor katalog produk dari file JSON (memungkinkan transfer antar-domain/Vercel)
  const importProducts = (importedList: Product[]): boolean => {
    if (!Array.isArray(importedList) || importedList.length === 0) {
      showToast('File data produk tidak valid!', 'error');
      return false;
    }
    const isValid = importedList.every((p) => p && p.id && p.name && typeof p.price === 'number');
    if (!isValid) {
      showToast('Format data produk dalam file tidak sesuai!', 'error');
      return false;
    }
    setProducts(importedList);
    persistProducts(importedList);
    showToast(`${importedList.length} produk berhasil diimpor & disimpan permanen!`, 'success');
    return true;
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        transactions,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        checkoutTransaction,
        addProduct,
        updateProduct,
        deleteProduct,
        resetToInitialData,
        importProducts,
        exportProductsJson,
        activeReceipt,
        setActiveReceipt,
        toast,
        showToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
};
