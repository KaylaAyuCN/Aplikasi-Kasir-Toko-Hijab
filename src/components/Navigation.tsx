import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  FileText,
  Sparkles,
  Clock,
  Menu,
  X,
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'kasir' | 'produk' | 'laporan';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const { cart } = useStore();
  const [currentTime, setCurrentTime] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        new Intl.DateTimeFormat('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }).format(now)
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalItemsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    {
      id: 'kasir',
      label: 'Kasir',
      icon: <ShoppingBag className="w-4 h-4" />,
      badge: totalItemsInCart > 0 ? totalItemsInCart : undefined,
    },
    { id: 'produk', label: 'Produk', icon: <Package className="w-4 h-4" /> },
    { id: 'laporan', label: 'Laporan', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#D99AA6]/25 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div
          onClick={() => onTabChange('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#D99AA6] to-[#C98B97] flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif-brand font-bold text-lg text-[#765548] tracking-tight">
                Pulchra Hijab
              </span>
              <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.2 rounded-sm bg-[#D99AA6]/20 text-[#765548]">
                Kasir
              </span>
            </div>
            <p className="hidden sm:block text-[10px] text-[#765548]/70 italic -mt-0.5 font-light">
              Elegance in Every Veil
            </p>
          </div>
        </div>

        {/* Desktop 4 Main Menus */}
        <nav className="hidden md:flex items-center gap-1.5 bg-[#FFF8F0]/70 p-1 rounded-2xl border border-[#D99AA6]/25">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                  isActive
                    ? 'bg-[#D99AA6] text-white shadow-xs'
                    : 'text-[#765548] hover:bg-white hover:text-[#4E342E]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white text-[#D99AA6]' : 'bg-[#D99AA6] text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Info: Live Clock */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF8F0] border border-[#D99AA6]/25 text-[#765548] text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 text-[#D99AA6]" />
            <span>{currentTime} WIB</span>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-[#765548] hover:bg-[#FFF8F0] border border-[#D99AA6]/20"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#D99AA6]/20 bg-white px-4 py-3 space-y-1.5 shadow-md">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#D99AA6] text-white shadow-xs'
                    : 'text-[#765548] hover:bg-[#FFF8F0]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white text-[#D99AA6]' : 'bg-[#D99AA6] text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
