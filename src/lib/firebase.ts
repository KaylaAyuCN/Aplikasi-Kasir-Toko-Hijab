import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Product, Transaction } from '../types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore using the provisioned custom database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

// Mandatory connection test on app boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or starting up.');
    }
    return false;
  }
}

// ----------------- Product Cloud Persistence -----------------

export async function fetchProductsFromCloud(): Promise<Product[] | null> {
  const path = 'products';
  try {
    const colRef = collection(db, path);
    const snap = await getDocs(colRef);
    if (snap.empty) {
      return null;
    }
    const products: Product[] = [];
    snap.forEach((d) => {
      const data = d.data() as Product;
      if (data && data.id && data.name) {
        products.push(data);
      }
    });
    return products;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return null;
  }
}

export async function saveProductToCloud(product: Product): Promise<boolean> {
  const path = `products/${product.id}`;
  try {
    const docRef = doc(db, 'products', product.id);
    const payload = {
      id: product.id,
      name: product.name,
      category: product.category,
      target: product.target,
      price: Number(product.price) || 0,
      stock: Number(product.stock) || 0,
      image: product.image || '',
      description: product.description || '',
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRef, payload, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
}

export async function deleteProductFromCloud(productId: string): Promise<boolean> {
  const path = `products/${productId}`;
  try {
    const docRef = doc(db, 'products', productId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    return false;
  }
}

// ----------------- Transaction Cloud Persistence -----------------

export async function fetchTransactionsFromCloud(): Promise<Transaction[] | null> {
  const path = 'transactions';
  try {
    const colRef = collection(db, path);
    const q = query(colRef, orderBy('date', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      return null;
    }
    const transactions: Transaction[] = [];
    snap.forEach((d) => {
      const data = d.data() as Transaction;
      if (data && data.id) {
        transactions.push(data);
      }
    });
    return transactions;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return null;
  }
}

export async function saveTransactionToCloud(trx: Transaction): Promise<boolean> {
  const path = `transactions/${trx.id}`;
  try {
    const docRef = doc(db, 'transactions', trx.id);
    await setDoc(docRef, trx);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
}
