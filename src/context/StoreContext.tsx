import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
import {
  testConnection,
  fetchProductsFromCloud,
  saveProductToCloud,
  deleteProductFromCloud,
  fetchTransactionsFromCloud,
  saveTransactionToCloud,
} from '../lib/firebase';

interface StoreContextType {
  products: Product[];
  transactions: Transaction[];
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => boolean;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  checkoutTransaction: (payAmount: number, paymentMethod?: string) => Promise<Transaction | null>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  resetToInitialData: () => Promise<void>;
  importProducts: (importedList: Product[]) => Promise<boolean>;
  exportProductsJson: () => string;
  activeReceipt: Transaction | null;
  setActiveReceipt: (trx: Transaction | null) => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  isCloudSynced: boolean;
  isSyncing: boolean;
}

const StoreContext = createContext<StoreContextType | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Inisialisasi awal produk dari cache lokal untuk first paint instan
  const [products, setProducts] = useState<Product[]>(() => getInitialProducts());
  const [transactions, setTransactions] = useState<Transaction[]>(() => getInitialTransactions());
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(true);

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

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // 2. Hydration dan sinkronisasi Cloud Firestore saat aplikasi pertama kali berjalan
  useEffect(() => {
    let isMounted = true;

    async function initializeStoreData() {
      setIsSyncing(true);
      // Validasi koneksi awal ke Firestore
      await testConnection();

      try {
        // Ambil data produk terbaru dari Firestore
        const cloudProducts = await fetchProductsFromCloud();
        if (isMounted) {
          if (cloudProducts && cloudProducts.length > 0) {
            setProducts(cloudProducts);
            persistProducts(cloudProducts);
            setIsCloudSynced(true);
          } else {
            // Jika Firestore masih kosong (pertama kali provision), unggah produk bawaan agar tersimpan permanen
            const localCached = (await getItemDB<Product[]>(STORAGE_KEYS.PRODUCTS)) || getInitialProducts();
            const seedProducts = localCached.length > 0 ? localCached : INITIAL_PRODUCTS;
            setProducts(seedProducts);
            persistProducts(seedProducts);

            // Simpan produk awal ke Cloud Firestore secara asynchronous
            Promise.all(seedProducts.map((p) => saveProductToCloud(p))).then(() => {
              if (isMounted) setIsCloudSynced(true);
            });
          }
        }

        // Ambil data riwayat transaksi dari Firestore
        const cloudTrx = await fetchTransactionsFromCloud();
        if (isMounted) {
          if (cloudTrx && cloudTrx.length > 0) {
            setTransactions(cloudTrx);
            persistTransactions(cloudTrx);
          } else {
            const localTrx = (await getItemDB<Transaction[]>(STORAGE_KEYS.TRANSACTIONS)) || getInitialTransactions();
            const seedTrx = localTrx.length > 0 ? localTrx : INITIAL_TRANSACTIONS;
            setTransactions(seedTrx);
            persistTransactions(seedTrx);
            seedTrx.forEach((trx) => saveTransactionToCloud(trx));
          }
        }
      } catch (err) {
        console.warn('Gagal sinkronisasi data cloud Firestore, menggunakan penyimpanan lokal:', err);
      } finally {
        if (isMounted) {
          setIsSyncing(false);
        }
      }
    }

    initializeStoreData();

    return () => {
      isMounted = false;
    };
  }, []);

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
  const checkoutTransaction = async (payAmount: number, paymentMethod = 'Tunai'): Promise<Transaction | null> => {
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

    // 1. Deduct stock and update both local state and Firestore
    const updatedProducts = products.map((prod) => {
      const cartItem = cart.find((c) => c.product.id === prod.id);
      if (!cartItem) return prod;
      const updated = {
        ...prod,
        stock: Math.max(0, prod.stock - cartItem.quantity),
      };
      // Simpan perubahan pengurangan stok produk ke Firestore
      saveProductToCloud(updated);
      return updated;
    });

    setProducts(updatedProducts);
    persistProducts(updatedProducts);

    // 2. Save transaction to history (local & Firestore)
    const updatedTrx = [newTransaction, ...transactions];
    setTransactions(updatedTrx);
    persistTransactions(updatedTrx);
    saveTransactionToCloud(newTransaction);

    // 3. Clear cart
    clearCart();

    // 4. Show receipt modal
    setActiveReceipt(newTransaction);
    showToast(`Transaksi ${invoiceNumber} berhasil diselesaikan!`, 'success');

    return newTransaction;
  };

  // Add new product (syncs to Cloud Firestore & Local DB)
  const addProduct = async (productData: Omit<Product, 'id'>) => {
    const id = `PRD-${Date.now().toString().slice(-4)}`;
    const newProd: Product = {
      ...productData,
      id,
    };
    const updatedList = [newProd, ...products];
    setProducts(updatedList);
    persistProducts(updatedList);

    // Simpan ke Cloud Firestore permanen
    const success = await saveProductToCloud(newProd);
    if (success) {
      showToast(`Produk "${newProd.name}" berhasil ditambahkan & tersimpan di Cloud!`, 'success');
    } else {
      showToast(`Produk "${newProd.name}" tersimpan di lokal (mode offline)`, 'info');
    }
  };

  // Update existing product (syncs to Cloud Firestore & Local DB)
  const updateProduct = async (updatedProduct: Product) => {
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

    // Simpan ke Cloud Firestore permanen
    const success = await saveProductToCloud(updatedProduct);
    if (success) {
      showToast(`Foto & data "${updatedProduct.name}" berhasil diperbarui permanen!`, 'success');
    } else {
      showToast(`Produk "${updatedProduct.name}" diperbarui di memori lokal`, 'info');
    }
  };

  // Delete product (syncs to Cloud Firestore & Local DB)
  const deleteProduct = async (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    const updatedList = products.filter((p) => p.id !== productId);
    setProducts(updatedList);
    persistProducts(updatedList);
    setCart((prev) => prev.filter((item) => item.product.id !== productId));

    // Hapus dari Cloud Firestore
    await deleteProductFromCloud(productId);
    showToast(`Produk "${prod?.name || ''}" telah dihapus`, 'info');
  };

  // Reset to initial demo data
  const resetToInitialData = async () => {
    setProducts(INITIAL_PRODUCTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setCart([]);
    persistProducts(INITIAL_PRODUCTS);
    persistTransactions(INITIAL_TRANSACTIONS);

    // Reset di cloud juga
    for (const p of INITIAL_PRODUCTS) {
      await saveProductToCloud(p);
    }
    showToast('Data aplikasi berhasil dikembalikan ke data awal & disinkronkan', 'info');
  };

  // Ekspor seluruh katalog produk (termasuk foto) ke file JSON
  const exportProductsJson = (): string => {
    return JSON.stringify(products, null, 2);
  };

  // Impor katalog produk dari file JSON
  const importProducts = async (importedList: Product[]): Promise<boolean> => {
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

    // Unggah semua produk impor ke Cloud Firestore
    Promise.all(importedList.map((p) => saveProductToCloud(p))).then(() => {
      showToast(`${importedList.length} produk berhasil diimpor & tersimpan permanen di Cloud!`, 'success');
    });

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
        isCloudSynced,
        isSyncing,
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
