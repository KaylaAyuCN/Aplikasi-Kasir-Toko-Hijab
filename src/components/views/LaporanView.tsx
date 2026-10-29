import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { exportToCsv, formatDate, formatDateTime, formatRupiah } from '../../utils/formatters';
import {
  FileText,
  Download,
  Search,
  Printer,
  TrendingUp,
  CreditCard,
  ShoppingBag,
  Clock,
  Sparkles,
} from 'lucide-react';

export const LaporanView: React.FC = () => {
  const { transactions, setActiveReceipt, showToast } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPeriod, setFilterPeriod] = useState<'semua' | 'hariIni' | '7hari'>('semua');

  // Filter transaksi
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    return transactions.filter((trx) => {
      const tDate = new Date(trx.date);

      if (filterPeriod === 'hariIni') {
        if (!trx.date.startsWith(todayStr)) return false;
      } else if (filterPeriod === '7hari') {
        if (tDate < sevenDaysAgo) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const mInv = trx.invoiceNumber.toLowerCase().includes(q);
        const mItem = trx.items.some((i) => i.name.toLowerCase().includes(q));
        return mInv || mItem;
      }

      return true;
    });
  }, [transactions, filterPeriod, searchQuery]);

  // Statistik akumulasi
  const totalOmzet = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
  }, [filteredTransactions]);

  const totalQtyTerjual = useMemo(() => {
    return filteredTransactions.reduce(
      (sum, t) => sum + t.items.reduce((s, i) => s + i.quantity, 0),
      0
    );
  }, [filteredTransactions]);

  const rataRataTransaksi = useMemo(() => {
    if (filteredTransactions.length === 0) return 0;
    return Math.round(totalOmzet / filteredTransactions.length);
  }, [filteredTransactions, totalOmzet]);

  // Ekspor ke format CSV
  const handleExportCsv = () => {
    if (filteredTransactions.length === 0) {
      showToast('Tidak ada data transaksi untuk diekspor', 'error');
      return;
    }

    const headers = [
      'Nomor Nota / Invoice',
      'Tanggal & Waktu',
      'Daftar Produk yang Dibeli',
      'Total Belanja (Rp)',
      'Uang Pembayaran (Rp)',
      'Kembalian (Rp)',
      'Metode Bayar',
      'Kasir',
    ];

    const rows = filteredTransactions.map((t) => [
      t.invoiceNumber,
      formatDateTime(t.date),
      t.items.map((i) => `${i.name} (${i.quantity}x)`).join('; '),
      t.totalAmount,
      t.payAmount,
      t.changeAmount,
      t.paymentMethod,
      t.cashierName,
    ]);

    exportToCsv(
      `Laporan_Penjualan_PulchraHijab_${new Date().toISOString().slice(0, 10)}`,
      headers,
      rows
    );

    showToast('Laporan penjualan berhasil diekspor ke file CSV', 'success');
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#D99AA6]/25 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-[#D99AA6]" />
            <h2 className="font-serif-brand text-xl font-bold text-[#765548]">
              Laporan & Riwayat Penjualan
            </h2>
          </div>
          <p className="text-xs text-[#765548]/70">
            Lihat rekapitulasi total omzet penjualan, riwayat nota transaksi, dan unduh laporan ke CSV.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#D99AA6] hover:bg-[#C98B97] text-white font-bold text-xs shadow-md active:scale-95 transition-all self-start cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Ekspor Laporan CSV
        </button>
      </div>

      {/* Kartu Ringkasan Penjualan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Penjualan */}
        <div className="bg-white p-5 rounded-3xl border border-[#D99AA6]/25 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#765548]/70">
              Total Penjualan (Omzet)
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#D99AA6]/15 flex items-center justify-center text-[#D99AA6]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#765548] mt-3">
            {formatRupiah(totalOmzet)}
          </div>
          <p className="text-[11px] text-[#765548]/60 mt-1">
            Dari {filteredTransactions.length} transaksi penjualan
          </p>
        </div>

        {/* Total Barang Terjual */}
        <div className="bg-white p-5 rounded-3xl border border-[#D99AA6]/25 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#765548]/70">
              Barang Terjual
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#765548] mt-3">
            {totalQtyTerjual} <span className="text-sm font-normal text-neutral-500">pcs</span>
          </div>
          <p className="text-[11px] text-[#765548]/60 mt-1">
            Total hijab dewasa & anak yang laku
          </p>
        </div>

        {/* Rata-rata per Transaksi */}
        <div className="bg-white p-5 rounded-3xl border border-[#D99AA6]/25 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#765548]/70">
              Rata-rata Transaksi
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FFF8F0] border border-[#D99AA6]/30 flex items-center justify-center text-[#765548]">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#765548] mt-3">
            {formatRupiah(rataRataTransaksi)}
          </div>
          <p className="text-[11px] text-[#765548]/60 mt-1">
            Rata-rata nilai belanja per pembeli
          </p>
        </div>
      </div>

      {/* Toolbar Filter & Pencarian Laporan */}
      <div className="bg-white p-4 rounded-3xl border border-[#D99AA6]/25 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-[#765548]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nomor nota atau produk..."
            className="w-full pl-10 pr-3 py-2 text-xs bg-[#FFF8F0]/40 border border-[#D99AA6]/30 rounded-2xl focus:bg-white focus:outline-hidden focus:border-[#D99AA6]"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-2xl w-full sm:w-auto">
          {[
            { id: 'semua', label: 'Semua Periode' },
            { id: 'hariIni', label: 'Hari Ini' },
            { id: '7hari', label: '7 Hari Terakhir' },
          ].map((period) => (
            <button
              key={period.id}
              onClick={() => setFilterPeriod(period.id as any)}
              className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                filterPeriod === period.id
                  ? 'bg-white text-[#765548] shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabel Riwayat Transaksi */}
      <div className="bg-white rounded-3xl border border-[#D99AA6]/25 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FFF8F0] text-[#765548] uppercase text-[10px] font-bold border-b border-[#D99AA6]/15">
              <tr>
                <th className="p-3.5">No. Nota</th>
                <th className="p-3.5">Waktu Transaksi</th>
                <th className="p-3.5">Rincian Barang</th>
                <th className="p-3.5">Metode</th>
                <th className="p-3.5 text-right">Total Belanja</th>
                <th className="p-3.5 text-right">Uang Bayar</th>
                <th className="p-3.5 text-right">Kembalian</th>
                <th className="p-3.5 text-center">Struk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-neutral-500">
                    Tidak ada riwayat transaksi penjualan pada periode ini.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-neutral-50/50">
                    <td className="p-3.5 font-bold font-mono text-[#765548]">
                      {trx.invoiceNumber}
                    </td>
                    <td className="p-3.5 text-neutral-600 whitespace-nowrap">
                      {formatDateTime(trx.date)}
                    </td>
                    <td className="p-3.5 text-neutral-700 max-w-xs">
                      <div className="space-y-0.5">
                        {trx.items.map((it, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                            <span className="font-bold text-[#765548]">{it.quantity}x</span>
                            <span className="truncate">{it.name}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF8F0] text-[#765548] border border-[#D99AA6]/30">
                        {trx.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-extrabold text-[#765548]">
                      {formatRupiah(trx.totalAmount)}
                    </td>
                    <td className="p-3.5 text-right text-neutral-600">
                      {formatRupiah(trx.payAmount)}
                    </td>
                    <td className="p-3.5 text-right font-semibold text-emerald-700">
                      {formatRupiah(trx.changeAmount)}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => setActiveReceipt(trx)}
                        title="Cetak Ulang Struk"
                        className="p-1.5 rounded-xl bg-[#FFF8F0] hover:bg-[#D99AA6] hover:text-white text-[#765548] border border-[#D99AA6]/30 transition-colors cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
