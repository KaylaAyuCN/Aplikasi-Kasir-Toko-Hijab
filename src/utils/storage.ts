import { Product, Transaction } from '../types';
import { INITIAL_PRODUCTS, INITIAL_TRANSACTIONS } from '../data/initialData';

const DB_NAME = 'PulchraHijabDB';
const DB_VERSION = 1;
const STORE_NAME = 'store';

// Canonical storage keys to avoid key collisions and stale cache
export const STORAGE_KEYS = {
  PRODUCTS: 'pulchra_hijab_products_v3',
  TRANSACTIONS: 'pulchra_hijab_transactions_v3',
  CART: 'pulchra_hijab_cart_v3',
};

/**
 * Membuka koneksi IndexedDB dengan aman.
 * IndexedDB memiliki batas penyimpanan jauh lebih besar (ratusan MB)
 * dibanding localStorage (maks 5MB), sehingga foto produk Base64 tersimpan aman
 * tanpa risiko QuotaExceededError di Vercel maupun perangkat mobile.
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB tidak didukung pada browser ini'));
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Menyimpan data ke IndexedDB
 */
export async function setItemDB<T>(key: string, value: T): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Gagal menyimpan ke IndexedDB:', err);
  }
}

/**
 * Membaca data dari IndexedDB
 */
export async function getItemDB<T>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Gagal membaca dari IndexedDB:', err);
    return null;
  }
}

/**
 * Membaca data produk awal secara sinkron dari localStorage (atau migrasi dari key lama).
 * Membersihkan key lama yang bertabrakan ('pulchra_products_v2') agar data terbaru
 * tidak pernah tertimpa oleh cache lama saat di-refresh di Vercel.
 */
export function getInitialProducts(): Product[] {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  try {
    // 1. Cek key kanonikal v3 terlebih dahulu
    const savedV3 = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (savedV3) {
      const parsed = JSON.parse(savedV3);
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0].price === 'number') {
        // Hapus key lama yang berpotensi konflik
        localStorage.removeItem('pulchra_products_v2');
        localStorage.removeItem('pulchra_products');
        return parsed;
      }
    }

    // 2. Migrasi dari key lama jika ada (pulchra_products atau pulchra_products_v2)
    const oldSaved =
      localStorage.getItem('pulchra_products') || localStorage.getItem('pulchra_products_v2');
    if (oldSaved) {
      const parsed = JSON.parse(oldSaved);
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0].price === 'number') {
        // Simpan ke key baru dan bersihkan key lama
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(parsed));
        localStorage.removeItem('pulchra_products_v2');
        localStorage.removeItem('pulchra_products');
        return parsed;
      }
    }

    // Bersihkan key lama jika data tidak valid
    localStorage.removeItem('pulchra_products_v2');
    return INITIAL_PRODUCTS;
  } catch (err) {
    console.warn('Gagal membaca produk dari localStorage:', err);
    return INITIAL_PRODUCTS;
  }
}

/**
 * Menyimpan produk secara permanen ke dual-layer:
 * 1. IndexedDB (kapasitas besar, mendukung foto Base64 utuh)
 * 2. localStorage (sinkronisasi instan saat startup)
 */
export function persistProducts(products: Product[]): void {
  // 1. Simpan ke IndexedDB
  setItemDB(STORAGE_KEYS.PRODUCTS, products);

  // 2. Simpan ke localStorage dengan penanganan kuota
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      // Pastikan key lama yang berpotensi menimbulkan bug telah bersih
      localStorage.removeItem('pulchra_products');
      localStorage.removeItem('pulchra_products_v2');
    } catch (quotaError) {
      console.warn('Batas kuota localStorage tercapai, data foto tetap aman di IndexedDB:', quotaError);
      try {
        // Jika kuota localStorage penuh karena ukuran foto Base64, simpan versi ringkas
        // di localStorage sementara foto lengkap tetap tersimpan di IndexedDB
        const fallbackList = products.map((p) => ({
          ...p,
          image: p.image.startsWith('data:') ? '' : p.image,
        }));
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(fallbackList));
      } catch {
        // Abaikan jika localStorage benar-benar diblokir browser
      }
    }
  }
}

/**
 * Membaca data transaksi awal
 */
export function getInitialTransactions(): Transaction[] {
  if (typeof window === 'undefined') return INITIAL_TRANSACTIONS;
  try {
    const saved =
      localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) ||
      localStorage.getItem('pulchra_transactions');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(parsed));
        localStorage.removeItem('pulchra_transactions');
        return parsed;
      }
    }
    return INITIAL_TRANSACTIONS;
  } catch {
    return INITIAL_TRANSACTIONS;
  }
}

/**
 * Menyimpan data transaksi ke IndexedDB dan localStorage
 */
export function persistTransactions(transactions: Transaction[]): void {
  setItemDB(STORAGE_KEYS.TRANSACTIONS, transactions);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
      localStorage.removeItem('pulchra_transactions');
    } catch (e) {
      console.warn('Gagal menyimpan transaksi ke localStorage:', e);
    }
  }
}
