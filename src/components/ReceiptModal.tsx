import React from 'react';
import { Transaction } from '../types';
import { formatDateTime, formatRupiah } from '../utils/formatters';
import { Printer, X, Sparkles, CheckCircle2 } from 'lucide-react';

interface ReceiptModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
        {/* Modal Topbar */}
        <div className="px-5 py-3.5 bg-[#FFF8F0] border-b border-[#D99AA6]/20 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#765548]">
            <Sparkles className="w-4 h-4 text-[#D99AA6]" />
            <span className="font-serif-brand font-bold text-sm">Struk Pembayaran</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#765548]/60 hover:text-[#765548] hover:bg-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Paper */}
        <div className="p-6 overflow-y-auto flex-1 bg-white font-mono text-xs text-neutral-800">
          <div
            id="printable-receipt"
            className="p-4 border border-dashed border-neutral-300 rounded-xl bg-neutral-50/60 text-center"
          >
            {/* Header Toko */}
            <h2 className="font-serif-brand text-lg font-bold text-[#765548] tracking-wide">
              PULCHRA HIJAB
            </h2>
            <p className="text-[11px] text-[#765548]/70 italic -mt-0.5">
              Elegance in Every Veil
            </p>
            <p className="text-[10px] text-neutral-500 mt-1">
              Jl. Senopati Raya No. 18, Jakarta
            </p>
            <p className="text-[10px] text-neutral-500">WA: 0812-8899-7766</p>

            {/* Garis Pemisah */}
            <div className="border-b border-dashed border-neutral-300 my-3" />

            {/* Info Transaksi */}
            <div className="text-left text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-neutral-500">No. Nota:</span>
                <span className="font-semibold text-neutral-800">{transaction.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Waktu:</span>
                <span>{formatDateTime(transaction.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Kasir:</span>
                <span>{transaction.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Metode:</span>
                <span>{transaction.paymentMethod}</span>
              </div>
            </div>

            {/* Garis Pemisah */}
            <div className="border-b border-dashed border-neutral-300 my-3" />

            {/* Daftar Produk */}
            <div className="text-left space-y-2 text-[11px]">
              {transaction.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-medium text-neutral-900 leading-tight">
                    {item.name}
                  </div>
                  <div className="flex justify-between text-neutral-500 text-[10px]">
                    <span>
                      {item.quantity} x {formatRupiah(item.price)}
                    </span>
                    <span className="font-semibold text-neutral-900">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Garis Pemisah */}
            <div className="border-b border-dashed border-neutral-300 my-3" />

            {/* Ringkasan Pembayaran */}
            <div className="text-left space-y-1 text-[11px]">
              <div className="flex justify-between font-bold text-sm text-[#765548] pt-1">
                <span>TOTAL:</span>
                <span>{formatRupiah(transaction.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-neutral-600 pt-1">
                <span>Tunai / Bayar:</span>
                <span>{formatRupiah(transaction.payAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold text-emerald-700">
                <span>Kembalian:</span>
                <span>{formatRupiah(transaction.changeAmount)}</span>
              </div>
            </div>

            {/* Garis Pemisah */}
            <div className="border-b border-dashed border-neutral-300 my-3" />

            {/* Footer Ucapan */}
            <div className="text-[10px] text-neutral-500 space-y-1 pt-1">
              <p>Terima kasih telah berbelanja di Pulchra Hijab.</p>
              <p className="italic">Koleksi hijab anggun dewasa & anak-anak.</p>
              <p className="text-[9px] text-neutral-400 mt-2">
                Barang yang sudah dibeli dapat ditukar maksimal 3 hari dengan struk asli.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-[#FFF8F0] border-t border-[#D99AA6]/20 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#765548] hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#D99AA6] hover:bg-[#C2828F] rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak Struk
          </button>
        </div>
      </div>
    </div>
  );
};
