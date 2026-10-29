import React from 'react';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = useStore();

  if (!toast) return null;

  let bgClass = 'bg-[#FFF8F0] border-emerald-400 text-[#4E342E]';
  let icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;

  if (toast.type === 'error') {
    bgClass = 'bg-[#FFF8F0] border-rose-400 text-rose-900';
    icon = <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />;
  } else if (toast.type === 'info') {
    bgClass = 'bg-[#FFF8F0] border-[#D99AA6] text-[#765548]';
    icon = <Info className="w-5 h-5 text-[#D99AA6] shrink-0" />;
  }

  return (
    <div className="fixed top-5 right-5 z-50 max-w-sm w-full animate-in fade-in slide-in-from-top-3">
      <div
        className={`flex items-start gap-3 p-3.5 rounded-2xl shadow-xl border text-xs font-semibold ${bgClass}`}
      >
        {icon}
        <div className="flex-1 leading-relaxed">{toast.message}</div>
      </div>
    </div>
  );
};
