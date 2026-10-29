import React, { useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { formatDateTime, formatRupiah } from '../../utils/formatters';
import {
  TrendingUp,
  CreditCard,
  Package,
  AlertTriangle,
  ShoppingBag,
  ArrowRight,
  Clock,
  Sparkles,
  Baby,
  Smile,
  Printer,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: 'dashboard' | 'kasir' | 'produk' | 'laporan') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { products, transactions, setActiveReceipt } = useStore();

  // 1. Total Omzet dihitung dari seluruh transaksi tersimpan
  const totalOmzet = useMemo(() => {
    return transactions.reduce((sum, trx) => sum + trx.totalAmount, 0);
  }, [transactions]);

  // 2. Jumlah transaksi tersimpan
  const totalTransaksi = transactions.length;

  // 3. Total stok dan produk
  const totalProduk = products.length;
  const totalStok = useMemo(() => {
    return products.reduce((sum, p) => sum + p.stock, 0);
  }, [products]);

  // 4. Produk dengan stok menipis (< 10 pcs)
  const lowStockProducts = useMemo(() => {
    return products.filter((p) => p.stock < 10);
  }, [products]);

  // 5. Transaksi terbaru (5 transaksi terakhir)
  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5);
  }, [transactions]);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Banner Sambutan */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#D99AA6] via-[#C98B97] to-[#765548] p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="inline-flex items-center mb-1">
              <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-widest px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-white">
                Kasir & Manajemen Toko
              </span>
            </div>
            <h1 className="font-serif-brand text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
              Pulchra Hijab
            </h1>
            <p className="text-xs sm:text-sm text-white/85 font-light italic tracking-wide">
              "Elegance in Every Veil"
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('kasir')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-[#765548] font-bold text-xs sm:text-sm shadow-md hover:bg-[#FFF8F0] active:scale-95 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-[#D99AA6]" />
              Buka Menu Kasir
            </button>
          </div>
        </div>

        {/* Ornamen visual */}
        <div className="absolute -right-8 -bottom-10 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
      </div>

      {/* Kartu Statistik Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Omzet */}
        <div className="bg-white p-5 rounded-3xl border border-[#D99AA6]/25 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#765548]/70">
              Total Omzet
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#D99AA6]/15 flex items-center justify-center text-[#D99AA6]">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-[#765548]">
              {formatRupiah(totalOmzet)}
            </div>
            <p className="text-[11px] text-[#765548]/60 mt-1">
              Akumulasi dari transaksi nyata
            </p>
          </div>
        </div>

        {/* Jumlah Transaksi */}
        <div className="bg-white p-5 rounded-3xl border border-[#D99AA6]/25 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#765548]/70">
              Jumlah Transaksi
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-[#765548]">
              {totalTransaksi} <span className="text-sm font-normal text-neutral-500">Nota</span>
            </div>
            <p className="text-[11px] text-[#765548]/60 mt-1">
              Tersimpan di localStorage
            </p>
          </div>
        </div>

        {/* Total Produk */}
        <div
          onClick={() => onNavigate('produk')}
          className="bg-white p-5 rounded-3xl border border-[#D99AA6]/25 shadow-xs flex flex-col justify-between cursor-pointer hover:border-[#D99AA6] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#765548]/70">
              Total Katalog
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#FFF8F0] border border-[#D99AA6]/30 flex items-center justify-center text-[#765548]">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-[#765548]">
              {totalProduk} <span className="text-sm font-normal text-neutral-500">Produk</span>
            </div>
            <div className="text-[11px] text-[#D99AA6] font-semibold mt-1 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              <span>{totalStok} pcs total stok</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Peringatan Stok Menipis */}
        <div
          onClick={() => onNavigate('produk')}
          className="bg-white p-5 rounded-3xl border border-[#D99AA6]/25 shadow-xs flex flex-col justify-between cursor-pointer hover:border-amber-400 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#765548]/70">
              Stok Menipis
            </span>
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                lowStockProducts.length > 0
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-[#765548]">
              {lowStockProducts.length}{' '}
              <span className="text-sm font-normal text-neutral-500">Item</span>
            </div>
            <p className="text-[11px] text-amber-700 font-semibold mt-1">
              {lowStockProducts.length > 0 ? 'Perlu ditambah stok segera' : 'Semua stok dalam batas aman'}
            </p>
          </div>
        </div>
      </div>

      {/* Bagian Bawah: Produk Stok Menipis & Transaksi Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daftar Transaksi Terbaru */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#D99AA6]/25 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#D99AA6]/15">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D99AA6]" />
                <h3 className="font-serif-brand font-bold text-base text-[#765548]">
                  Transaksi Terbaru
                </h3>
              </div>
              <button
                onClick={() => onNavigate('laporan')}
                className="text-xs font-bold text-[#D99AA6] hover:text-[#C98B97] flex items-center gap-1 cursor-pointer"
              >
                Lihat Semua Laporan
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-3 divide-y divide-neutral-100">
              {recentTransactions.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-500">
                  Belum ada transaksi tersimpan. Silakan buka menu Kasir untuk mencoba.
                </div>
              ) : (
                recentTransactions.map((trx) => (
                  <div
                    key={trx.id}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-[#FFF8F0]/40 px-2 rounded-xl transition-colors"
                  >
                    <div>
                      <span className="font-mono font-bold text-xs text-[#765548] block">
                        {trx.invoiceNumber}
                      </span>
                      <span className="text-[11px] text-neutral-500 block mt-0.5">
                        {formatDateTime(trx.date)} • {trx.items.length} jenis item
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-[#765548] block">
                          {formatRupiah(trx.totalAmount)}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold block">
                          Lunas
                        </span>
                      </div>
                      <button
                        onClick={() => setActiveReceipt(trx)}
                        title="Lihat Struk"
                        className="p-1.5 rounded-lg bg-[#FFF8F0] hover:bg-[#D99AA6]/20 text-[#765548] border border-[#D99AA6]/30 transition-colors cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Peringatan Stok Menipis */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#D99AA6]/25 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#D99AA6]/15">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="font-serif-brand font-bold text-base text-[#765548]">
                  Peringatan Stok Menipis (&lt; 10 pcs)
                </h3>
              </div>
              <button
                onClick={() => onNavigate('produk')}
                className="text-xs font-bold text-[#D99AA6] hover:text-[#C98B97] cursor-pointer"
              >
                Kelola Stok &rarr;
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {lowStockProducts.length === 0 ? (
                <div className="py-8 text-center text-xs text-emerald-700 font-medium">
                  Alhamdulillah! Semua stok hijab dewasa & anak dalam kondisi aman.
                </div>
              ) : (
                lowStockProducts.slice(0, 5).map((prod) => (
                  <div
                    key={prod.id}
                    className="p-2.5 rounded-2xl border border-amber-200 bg-amber-50/40 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-10 h-10 rounded-xl object-cover shrink-0 border border-amber-200"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#765548] truncate">
                          {prod.name}
                        </h4>
                        <div className="text-[10px] text-[#765548]/70 flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`px-1.5 py-0.2 rounded font-semibold ${
                              prod.target === 'Anak-anak'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {prod.target}
                          </span>
                          <span>•</span>
                          <span>{prod.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold text-amber-800 block">
                        Sisa {prod.stock} pcs
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#D99AA6]/15 flex items-center justify-between text-xs text-[#765548]/70">
            <span>Koleksi hijab anak & dewasa otomatis terbarui saat kasir melakukan transaksi.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
