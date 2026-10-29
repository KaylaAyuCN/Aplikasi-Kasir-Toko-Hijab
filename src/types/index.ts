export interface Product {
  id: string;
  name: string;
  category: string; // e.g. 'Pashmina', 'Segi Empat', 'Bergo', 'Hijab Instan', 'Hijab Sekolah', 'Aksesori'
  target: 'Dewasa' | 'Anak-anak';
  price: number;
  stock: number;
  image: string;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface TransactionItem {
  productId: string;
  name: string;
  target: 'Dewasa' | 'Anak-anak';
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  date: string; // ISO string
  items: TransactionItem[];
  totalAmount: number;
  payAmount: number;
  changeAmount: number;
  cashierName: string;
  paymentMethod: string;
}
