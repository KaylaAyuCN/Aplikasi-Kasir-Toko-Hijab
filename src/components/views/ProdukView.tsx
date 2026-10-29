import React, { useState, useMemo, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { formatRupiah, compressImage } from '../../utils/formatters';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  Baby,
  Smile,
  Layers,
  X,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Upload,
  ImageIcon,
  Camera,
  Check,
} from 'lucide-react';

export const ProdukView: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, resetToInitialData, showToast } =
    useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTarget, setSelectedTarget] = useState<'Semua' | 'Dewasa' | 'Anak-anak'>('Semua');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Pashmina');
  const [target, setTarget] = useState<'Dewasa' | 'Anak-anak'>('Dewasa');
  const [price, setPrice] = useState<number>(65000);
  const [stock, setStock] = useState<number>(20);
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');

  // Upload Foto File State & Ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Harap pilih file gambar (JPG, PNG, atau WEBP)!', 'error');
      return;
    }

    try {
      setIsUploading(true);
      const dataUrl = await compressImage(file);
      setImage(dataUrl);
      showToast('Foto hijab berhasil dipilih! Pratinjau diperbarui.', 'success');
    } catch {
      showToast('Gagal memproses file foto gambar!', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Preset foto hijab cepat
  const PRESET_IMAGES = [
    {
      label: 'Pashmina',
      url: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=500&auto=format&fit=crop&q=80',
    },
    {
      label: 'Voal Pink',
      url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&auto=format&fit=crop&q=80',
    },
    {
      label: 'Bergo Hitam',
      url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=80',
    },
    {
      label: 'Bergo Balita',
      url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=500&auto=format&fit=crop&q=80',
    },
    {
      label: 'Hijab Anak',
      url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=500&auto=format&fit=crop&q=80',
    },
    {
      label: 'Seragam Sekolah',
      url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80',
    },
  ];

  // Filter produk
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedTarget !== 'Semua' && p.target !== selectedTarget) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [products, selectedTarget, searchQuery]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setCategory('Pashmina');
    setTarget('Dewasa');
    setPrice(65000);
    setStock(20);
    setImage(PRESET_IMAGES[0].url);
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setTarget(p.target);
    setPrice(p.price);
    setStock(p.stock);
    setImage(p.image);
    setDescription(p.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Nama produk wajib diisi!', 'error');
      return;
    }

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name: name.trim(),
        category,
        target,
        price: Number(price) || 0,
        stock: Number(stock) || 0,
        image: image || PRESET_IMAGES[0].url,
        description: description.trim() || undefined,
      });
    } else {
      addProduct({
        name: name.trim(),
        category,
        target,
        price: Number(price) || 0,
        stock: Number(stock) || 0,
        image: image || PRESET_IMAGES[0].url,
        description: description.trim() || undefined,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (p: Product) => {
    if (window.confirm(`Yakin ingin menghapus produk "${p.name}"?`)) {
      deleteProduct(p.id);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#D99AA6]/25 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-5 h-5 text-[#D99AA6]" />
            <h2 className="font-serif-brand text-xl font-bold text-[#765548]">
              Manajemen Produk & Stok
            </h2>
          </div>
          <p className="text-xs text-[#765548]/70">
            Atur katalog hijab dewasa & anak-anak, ubah harga, dan perbarui stok barang toko.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#D99AA6] hover:bg-[#C98B97] text-white font-bold text-xs shadow-md active:scale-95 transition-all self-start cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tambah Produk Baru
        </button>
      </div>

      {/* Toolbar Filter & Pencarian */}
      <div className="bg-white p-4 rounded-3xl border border-[#D99AA6]/25 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Input Pencarian */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-[#765548]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama produk hijab..."
            className="w-full pl-10 pr-3 py-2 text-xs bg-[#FFF8F0]/40 border border-[#D99AA6]/30 rounded-2xl focus:bg-white focus:outline-hidden focus:border-[#D99AA6]"
          />
        </div>

        {/* Filter Target Dewasa vs Anak */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-2xl w-full sm:w-auto">
          {(['Semua', 'Dewasa', 'Anak-anak'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTarget(t)}
              className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                selectedTarget === t
                  ? 'bg-white text-[#765548] shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Daftar Tabel Produk */}
      <div className="bg-white rounded-3xl border border-[#D99AA6]/25 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FFF8F0] text-[#765548] uppercase text-[10px] font-bold border-b border-[#D99AA6]/15">
              <tr>
                <th className="p-3.5">Produk Hijab</th>
                <th className="p-3.5">Segmen Usia</th>
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5">Harga Jual</th>
                <th className="p-3.5">Stok Fisik</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-500">
                    Tidak ada produk yang sesuai dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isHabis = p.stock <= 0;
                  const isMenipis = p.stock > 0 && p.stock < 10;

                  return (
                    <tr key={p.id} className="hover:bg-neutral-50/50">
                      <td className="p-3.5 font-bold text-[#765548]">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-10 h-10 rounded-xl object-cover border border-[#D99AA6]/20 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=200&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div>
                            <div className="font-bold text-xs">{p.name}</div>
                            {p.description && (
                              <div className="text-[10px] text-neutral-500 font-normal line-clamp-1 max-w-xs">
                                {p.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.target === 'Anak-anak'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {p.target}
                        </span>
                      </td>
                      <td className="p-3.5 text-neutral-600 font-medium">{p.category}</td>
                      <td className="p-3.5 font-extrabold text-[#765548]">
                        {formatRupiah(p.price)}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isHabis
                              ? 'bg-rose-100 text-rose-800'
                              : isMenipis
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {p.stock} pcs {isHabis ? '(Habis)' : isMenipis ? '(Menipis)' : ''}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            title="Edit Produk"
                            className="p-1.5 rounded-lg text-[#765548] hover:bg-[#FFF8F0] border border-neutral-200 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p)}
                            title="Hapus Produk"
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-neutral-200 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tombol Reset Data Demo */}
      <div className="flex justify-end pt-2">
        <button
          onClick={() => {
            if (window.confirm('Kembalikan seluruh produk ke data contoh bawaan Pulchra Hijab?')) {
              resetToInitialData();
            }
          }}
          className="flex items-center gap-1.5 text-xs text-[#765548]/70 hover:text-[#765548] hover:underline cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset ke Data Contoh Bawaan
        </button>
      </div>

      {/* MODAL FORM TAMBAH / EDIT PRODUK */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-[#FFF8F0] border-b border-[#D99AA6]/20 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#D99AA6]" />
                <h3 className="font-serif-brand font-bold text-base text-[#765548]">
                  {editingProduct ? 'Edit Produk Hijab' : 'Tambah Produk Hijab Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#765548]/60 hover:text-[#765548]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-3.5 text-xs">
              {/* Nama Produk */}
              <div>
                <label className="block font-semibold text-[#765548] mb-1">Nama Produk *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Pashmina Silk Armani - Mauve"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-[#D99AA6] focus:bg-white"
                />
              </div>

              {/* Segmen Target (Dewasa vs Anak) */}
              <div>
                <label className="block font-semibold text-[#765548] mb-1">
                  Target Pengguna *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTarget('Dewasa')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      target === 'Dewasa'
                        ? 'bg-[#D99AA6] text-white border-[#D99AA6]'
                        : 'bg-neutral-50 text-[#765548] border-neutral-200'
                    }`}
                  >
                    Hijab Dewasa
                  </button>
                  <button
                    type="button"
                    onClick={() => setTarget('Anak-anak')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      target === 'Anak-anak'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-neutral-50 text-[#765548] border-neutral-200'
                    }`}
                  >
                    Hijab Anak-anak
                  </button>
                </div>
              </div>

              {/* Kategori */}
              <div>
                <label className="block font-semibold text-[#765548] mb-1">Kategori Hijab</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-[#D99AA6] focus:bg-white"
                >
                  <option value="Pashmina">Pashmina</option>
                  <option value="Segi Empat">Hijab Segi Empat</option>
                  <option value="Bergo">Bergo</option>
                  <option value="Hijab Instan">Hijab Instan</option>
                  <option value="Hijab Sekolah">Hijab Sekolah</option>
                  <option value="Aksesori">Aksesori & Ciput</option>
                </select>
              </div>

              {/* Harga & Stok */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#765548] mb-1">
                    Harga Jual (Rp) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={price}
                    onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold focus:border-[#D99AA6] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#765548] mb-1">
                    Jumlah Stok Fisik *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={stock}
                    onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-center focus:border-[#D99AA6] focus:bg-white"
                  />
                </div>
              </div>

              {/* Foto Produk */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-[#765548] text-xs">
                    Foto Produk Hijab *
                  </label>
                  {image && (
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border border-emerald-200">
                      <Check className="w-3 h-3 text-emerald-600" />
                      Preview Siap
                    </span>
                  )}
                </div>

                {/* Input File Tersembunyi */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Live Preview & Upload Area */}
                {image ? (
                  <div className="p-3 bg-[#FFF8F0]/70 border-2 border-dashed border-[#D99AA6]/50 rounded-2xl flex items-center gap-3.5">
                    <div className="relative group shrink-0">
                      <img
                        src={image}
                        alt="Preview Foto"
                        className="w-18 h-18 object-cover rounded-xl border border-[#D99AA6]/40 shadow-xs bg-white"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=200&auto=format&fit=crop&q=80';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-[#765548] truncate">
                          {image.startsWith('data:image') ? 'Foto Diunggah dari Laptop' : 'Foto Produk Terpasang'}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#765548]/70 mt-0.5 line-clamp-1">
                        Foto ini akan ditampilkan di kartu kasir & daftar produk, serta tersimpan otomatis.
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-[#D99AA6] text-white hover:bg-[#c88894] rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Upload className="w-3 h-3" />
                          Ganti Foto
                        </button>
                        <button
                          type="button"
                          onClick={() => setImage('')}
                          className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 cursor-pointer transition-colors"
                        >
                          Hapus Foto
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 bg-neutral-50 hover:bg-[#FFF8F0]/50 border-2 border-dashed border-neutral-300 hover:border-[#D99AA6] rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group text-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#FFF8F0] border border-[#D99AA6]/30 flex items-center justify-center text-[#D99AA6] group-hover:scale-110 transition-transform">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#765548]">
                        {isUploading ? 'Sedang Memproses Foto...' : 'Klik untuk Pilih Foto dari Laptop'}
                      </p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">
                        Format JPG, PNG, atau WEBP. Foto otomatis dioptimalkan agar ringan & awet.
                      </p>
                    </div>
                  </div>
                )}

                {/* Tombol Pilih Foto Utama */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full py-2.5 px-3 bg-[#FFF8F0] hover:bg-[#faeee0] text-[#765548] font-bold text-xs rounded-xl border border-[#D99AA6]/40 flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-[#D99AA6]" />
                  {isUploading ? 'Sedang Memproses Foto...' : 'Pilih Foto dari Laptop'}
                </button>

                {/* Opsi Tambahan: URL atau Preset Cepat */}
                <div className="pt-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] text-[#765548]/70 font-semibold">
                      Atau tempel URL gambar / pilih preset:
                    </span>
                  </div>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:border-[#D99AA6] focus:bg-white"
                  />

                  <div className="flex gap-1 overflow-x-auto pb-1 mt-1.5">
                    {PRESET_IMAGES.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setImage(img.url)}
                        className="text-[10px] whitespace-nowrap px-2 py-0.5 rounded-lg border border-neutral-200 hover:bg-[#FFF8F0] hover:border-[#D99AA6] text-[#765548] cursor-pointer transition-colors"
                      >
                        {img.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block font-semibold text-[#765548] mb-1">
                  Deskripsi / Keterangan Bahan
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Bahan, tekstur, atau ukuran hijab..."
                  className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-[#D99AA6] focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-white bg-[#D99AA6] hover:bg-[#C98B97] shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  {editingProduct ? 'Simpan Perubahan' : 'Tambahkan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
