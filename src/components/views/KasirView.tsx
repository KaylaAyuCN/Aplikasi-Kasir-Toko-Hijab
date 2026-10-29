import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Banknote,
  Baby,
  Smile,
  Layers,
  Sparkles,
  X,
  CreditCard,
  Building2,
} from 'lucide-react';

export const KasirView: React.FC = () => {
  const {
    products,
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    checkoutTransaction,
    showToast,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTarget, setSelectedTarget] = useState<'Semua' | 'Dewasa' | 'Anak-anak'>('Semua');
  const [paymentMethod, setPaymentMethod] = useState<'Tunai' | 'QRIS' | 'Transfer'>('Tunai');
  const [payAmountInput, setPayAmountInput] = useState<string>('');

  // Filter katalog produk
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedTarget !== 'Semua' && p.target !== selectedTarget) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q);
        const matchCat = p.category.toLowerCase().includes(q);
        return matchName || matchCat;
      }
      return true;
    });
  }, [products, selectedTarget, searchQuery]);

  // Hitung total belanja di keranjang
  const totalBelanja = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  // Hitung nominal bayar dan kembalian
  const nominalBayar = parseInt(payAmountInput) || 0;
  const kembalian = Math.max(0, nominalBayar - totalBelanja);
  const isUangKurang = nominalBayar < totalBelanja;

  // Tombol Uang Cepat
  const handleQuickCash = (amount: number) => {
    setPayAmountInput(amount.toString());
  };

  // Eksekusi Pembayaran
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      showToast('Keranjang belanja masih kosong! Silakan pilih produk terlebih dahulu.', 'error');
      return;
    }

    if (paymentMethod === 'Tunai' && isUangKurang) {
      showToast('Jumlah uang tunai yang dibayarkan masih kurang!', 'error');
      return;
    }

    const finalPay = paymentMethod === 'Tunai' ? nominalBayar : totalBelanja;
    const result = await checkoutTransaction(finalPay, paymentMethod);

    if (result) {
      setPayAmountInput('');
    }
  };

  return (
    <div className="h-full w-full flex flex-row gap-3 sm:gap-4 p-2 sm:p-4 max-w-7xl mx-auto overflow-hidden">
      {/* ============================================================ */}
      {/* KOLOM KIRI: KATALOG PRODUK HIJAB (BISA DIGULIR TERPISAH)    */}
      {/* ============================================================ */}
      <div className="flex-1 min-w-0 h-full flex flex-col bg-white rounded-2xl sm:rounded-3xl border border-[#D99AA6]/25 shadow-xs overflow-hidden">
        {/* Toolbar Pencarian & Filter Segmen */}
        <div className="shrink-0 p-3 sm:p-4 border-b border-[#D99AA6]/20 bg-[#FFF8F0]/40 space-y-2.5">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Input Pencarian */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#765548]/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari hijab dewasa, hijab anak, pasmina, bergo..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-[#D99AA6]/30 rounded-xl text-[#765548] placeholder-[#765548]/40 focus:outline-hidden focus:border-[#D99AA6] focus:ring-2 focus:ring-[#D99AA6]/30 transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Target Usia: Semua, Dewasa, Anak */}
            <div className="flex items-center gap-1 p-0.5 sm:p-1 bg-white border border-[#D99AA6]/30 rounded-xl shadow-xs self-start shrink-0">
              <button
                type="button"
                onClick={() => setSelectedTarget('Semua')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedTarget === 'Semua'
                    ? 'bg-[#765548] text-white shadow-xs'
                    : 'text-[#765548]/70 hover:bg-[#FFF8F0]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Semua
              </button>
              <button
                type="button"
                onClick={() => setSelectedTarget('Dewasa')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedTarget === 'Dewasa'
                    ? 'bg-[#D99AA6] text-white shadow-xs'
                    : 'text-[#765548]/70 hover:bg-[#FFF8F0]'
                }`}
              >
                <Smile className="w-3.5 h-3.5" />
                Dewasa
              </button>
              <button
                type="button"
                onClick={() => setSelectedTarget('Anak-anak')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedTarget === 'Anak-anak'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-[#765548]/70 hover:bg-[#FFF8F0]'
                }`}
              >
                <Baby className="w-3.5 h-3.5" />
                Anak
              </button>
            </div>
          </div>
        </div>

        {/* Hint Petunjuk Kasir */}
        <div className="shrink-0 px-3 sm:px-4 py-2 bg-[#FFF8F0]/80 border-b border-[#D99AA6]/15 flex items-center justify-between text-[11px] text-[#765548]">
          <span className="flex items-center gap-1.5 font-medium truncate">
            <Sparkles className="w-3.5 h-3.5 text-[#D99AA6] shrink-0" />
            <span>Klik tombol <strong>+ Tambah</strong> pada kartu produk untuk memasukkan ke keranjang.</span>
          </span>
          <span className="hidden sm:inline text-[#765548]/60 text-[10px] shrink-0 font-bold ml-2">
            {filteredProducts.length} produk
          </span>
        </div>

        {/* Grid Produk Kasir (Scroll Mandiri) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 min-h-0">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#765548]/60">
              <Search className="w-12 h-12 mb-3 text-[#D99AA6]/40" />
              <p className="font-serif-brand font-bold text-base text-[#765548]">
                Produk Tidak Ditemukan
              </p>
              <p className="text-xs text-[#765548]/60 mt-1 max-w-xs">
                Tidak ada produk yang cocok dengan pencarian "{searchQuery}".
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTarget('Semua');
                }}
                className="mt-3 px-3 py-1.5 rounded-xl bg-[#D99AA6] text-white text-xs font-semibold hover:bg-[#C98B97]"
              >
                Tampilkan Semua Produk
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map((prod) => {
                const isHabis = prod.stock <= 0;
                const isMenipis = prod.stock > 0 && prod.stock < 10;
                const inCart = cart.find((item) => item.product.id === prod.id);

                return (
                  <div
                    key={prod.id}
                    onClick={() => {
                      if (!isHabis) addToCart(prod, 1);
                    }}
                    className={`group relative bg-[#FFF8F0]/30 hover:bg-white rounded-2xl border transition-all flex flex-col overflow-hidden select-none ${
                      isHabis
                        ? 'opacity-60 cursor-not-allowed border-neutral-200'
                        : inCart
                        ? 'cursor-pointer border-[#D99AA6] bg-white ring-2 ring-[#D99AA6]/30 shadow-xs'
                        : 'cursor-pointer border-[#D99AA6]/20 hover:border-[#D99AA6] hover:shadow-md'
                    }`}
                  >
                    {/* Gambar Produk */}
                    <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=400&auto=format&fit=crop&q=80';
                        }}
                      />

                      {/* Lencana Segmen (Dewasa / Anak) */}
                      <span
                        className={`absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs ${
                          prod.target === 'Anak-anak'
                            ? 'bg-amber-600 text-white'
                            : 'bg-[#765548] text-white'
                        }`}
                      >
                        {prod.target}
                      </span>

                      {/* Lencana Jumlah di Keranjang */}
                      {inCart && (
                        <span className="absolute top-2 right-2 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#D99AA6] text-white shadow-xs">
                          {inCart.quantity} di keranjang
                        </span>
                      )}

                      {/* Lencana Stok */}
                      <span
                        className={`absolute bottom-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs ${
                          isHabis
                            ? 'bg-rose-600 text-white'
                            : isMenipis
                            ? 'bg-amber-500 text-white'
                            : 'bg-emerald-600/90 text-white backdrop-blur-xs'
                        }`}
                      >
                        {isHabis ? 'Habis' : `Stok: ${prod.stock}`}
                      </span>
                    </div>

                    {/* Rincian Nama & Harga */}
                    <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#D99AA6] tracking-wider block">
                          {prod.category}
                        </span>
                        <h4 className="text-xs font-bold text-[#765548] line-clamp-2 leading-snug mt-0.5 group-hover:text-[#4E342E]">
                          {prod.name}
                        </h4>
                        <span className="text-xs sm:text-sm font-extrabold text-[#765548] mt-1 block">
                          {formatRupiah(prod.price)}
                        </span>
                      </div>

                      {/* Tombol Tambah ke Keranjang */}
                      <div className="mt-2 pt-2 border-t border-[#D99AA6]/15">
                        {isHabis ? (
                          <div className="w-full py-1.5 text-center text-[10px] text-rose-600 font-bold bg-rose-50 rounded-xl">
                            Stok Habis
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(prod, 1);
                            }}
                            className="w-full py-1.5 px-3 rounded-xl bg-[#D99AA6] hover:bg-[#C98B97] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            + Tambah
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* KOLOM KANAN: KERANJANG TRANSAKSI & FORMULIR PEMBAYARAN       */}
      {/* ============================================================ */}
      <div className="w-72 sm:w-80 md:w-88 lg:w-96 shrink-0 h-full flex flex-col bg-white rounded-2xl sm:rounded-3xl border border-[#D99AA6]/25 shadow-xs overflow-hidden">
        {/* Header Keranjang */}
        <div className="shrink-0 p-3 sm:p-4 border-b border-[#D99AA6]/20 bg-[#FFF8F0]/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#D99AA6]" />
            <h3 className="font-serif-brand font-bold text-sm text-[#765548]">
              Keranjang
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D99AA6] text-white">
              {cart.reduce((sum, item) => sum + item.quantity, 0)} item
            </span>
          </div>

          {cart.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Kosongkan
            </button>
          )}
        </div>

        {/* Daftar Item di Keranjang (Bisa Digulir Terpisah) */}
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-2 min-h-0">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#765548]/50">
              <ShoppingCart className="w-10 h-10 mb-2 text-[#D99AA6]/40" />
              <p className="font-semibold text-xs text-[#765548]">Keranjang Masih Kosong</p>
              <p className="text-[11px] text-[#765548]/60 mt-1 max-w-[200px]">
                Klik tombol <strong>+ Tambah</strong> pada produk di sebelah kiri untuk berbelanja.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="p-2.5 rounded-xl border border-[#D99AA6]/20 bg-[#FFF8F0]/30 hover:bg-[#FFF8F0]/60 transition-all flex flex-col gap-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-9 h-9 rounded-lg object-cover border border-[#D99AA6]/30 shrink-0 bg-white"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=200&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                        item.product.target === 'Anak-anak'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.product.target}
                    </span>
                    <h5 className="font-bold text-xs text-[#765548] truncate mt-0.5">
                      {item.product.name}
                    </h5>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-[#765548]/40 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#D99AA6]/15">
                  {/* Stepper Kuantitas */}
                  <div className="flex items-center gap-1 bg-white border border-[#D99AA6]/30 rounded-lg p-0.5 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      className="p-1 text-[#765548] hover:bg-[#FFF8F0] rounded cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-[#765548]">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      disabled={item.quantity >= item.product.stock}
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      className="p-1 text-[#765548] hover:bg-[#FFF8F0] disabled:opacity-30 rounded cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Subtotal Item */}
                  <div className="text-right">
                    <span className="text-[10px] text-[#765548]/60 block">
                      @{formatRupiah(item.product.price)}
                    </span>
                    <span className="text-xs font-bold text-[#765548]">
                      {formatRupiah(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Formulir Pembayaran (Di Bagian Bawah Kolom Kanan) */}
        <form
          onSubmit={handleCheckout}
          className="shrink-0 p-3 sm:p-4 border-t border-[#D99AA6]/20 bg-[#FFF8F0]/50 space-y-2.5 overflow-y-auto max-h-[50%]"
        >
          {/* Total Belanja */}
          <div className="flex justify-between items-baseline">
            <span className="font-bold text-xs text-[#765548]">Total Tagihan:</span>
            <span className="font-extrabold text-lg sm:text-xl text-[#765548]">
              {formatRupiah(totalBelanja)}
            </span>
          </div>

          {/* Metode Pembayaran */}
          <div>
            <div className="grid grid-cols-3 gap-1">
              {(['Tunai', 'QRIS', 'Transfer'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => {
                    setPaymentMethod(method);
                    if (method !== 'Tunai') {
                      setPayAmountInput(totalBelanja.toString());
                    }
                  }}
                  className={`py-1 px-1.5 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer ${
                    paymentMethod === method
                      ? 'bg-[#D99AA6] text-white border-[#D99AA6] shadow-xs'
                      : 'bg-white text-[#765548] border-neutral-200 hover:bg-[#FFF8F0]'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Input Tunai & Kembalian */}
          {paymentMethod === 'Tunai' ? (
            <div className="space-y-1.5 p-2.5 rounded-xl bg-white border border-[#D99AA6]/30 shadow-2xs text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-[#765548] mb-0.5">
                  Uang Diterima (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  value={payAmountInput}
                  onChange={(e) => setPayAmountInput(e.target.value)}
                  placeholder="0"
                  className="w-full py-1.5 px-2.5 bg-neutral-50 border border-[#D99AA6]/40 rounded-lg text-sm font-bold text-[#765548] focus:bg-white focus:outline-hidden focus:border-[#D99AA6]"
                />
              </div>

              {/* Pilihan Uang Cepat */}
              <div>
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => handleQuickCash(totalBelanja)}
                    className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#FFF8F0] border border-[#D99AA6]/40 text-[#765548] hover:bg-[#D99AA6] hover:text-white transition-colors cursor-pointer"
                  >
                    Uang Pas
                  </button>
                  {[50000, 100000, 150000, 200000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleQuickCash(amt)}
                      className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                    >
                      {amt.toLocaleString('id-ID')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tampilan Kembalian */}
              <div className="pt-1.5 border-t border-neutral-100 flex justify-between items-center text-xs">
                <span className="font-bold text-[#765548]">Kembalian:</span>
                <span
                  className={`font-extrabold ${
                    isUangKurang && nominalBayar > 0 ? 'text-rose-600' : 'text-emerald-700'
                  }`}
                >
                  {isUangKurang && nominalBayar > 0
                    ? `Kurang ${formatRupiah(totalBelanja - nominalBayar)}`
                    : formatRupiah(kembalian)}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-2 rounded-xl bg-white border border-[#D99AA6]/30 text-center text-xs text-[#765548]">
              <span className="font-bold block text-[11px]">
                {paymentMethod === 'QRIS' ? 'QRIS Pulchra Hijab' : 'Transfer Bank Toko'}
              </span>
              <p className="text-[10px] text-neutral-500">
                Total: {formatRupiah(totalBelanja)}
              </p>
            </div>
          )}

          {/* Tombol Eksekusi Pembayaran */}
          <button
            type="submit"
            disabled={cart.length === 0 || (paymentMethod === 'Tunai' && isUangKurang)}
            className="w-full py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#D99AA6] hover:bg-[#C98B97] disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Banknote className="w-4 h-4" />
            Bayar Sekarang ({formatRupiah(totalBelanja)})
          </button>
        </form>
      </div>
    </div>
  );
};
