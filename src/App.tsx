/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navigation, ActiveTab } from './components/Navigation';
import { DashboardView } from './components/views/DashboardView';
import { KasirView } from './components/views/KasirView';
import { ProdukView } from './components/views/ProdukView';
import { LaporanView } from './components/views/LaporanView';
import { ReceiptModal } from './components/ReceiptModal';
import { Toast } from './components/Toast';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const { activeReceipt, setActiveReceipt } = useStore();

  return (
    <div className="min-h-screen bg-[#FFF8F0] text-[#765548] flex flex-col font-sans antialiased selection:bg-[#D99AA6]/20">
      {/* Navbar Atas dengan 4 Menu Utama */}
      <Navigation activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />

      {/* Konten Halaman Sesuai Menu yang Dipilih */}
      <main className={`flex-1 ${activeTab === 'kasir' ? 'h-[calc(100vh-4rem)] overflow-hidden' : 'pb-10 overflow-y-auto'}`}>
        {activeTab === 'dashboard' && <DashboardView onNavigate={(tab) => setActiveTab(tab)} />}
        {activeTab === 'kasir' && <KasirView />}
        {activeTab === 'produk' && <ProdukView />}
        {activeTab === 'laporan' && <LaporanView />}
      </main>

      {/* Modal Cetak Struk Kasir */}
      <ReceiptModal
        transaction={activeReceipt}
        onClose={() => setActiveReceipt(null)}
      />

      {/* Notifikasi Toast */}
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
