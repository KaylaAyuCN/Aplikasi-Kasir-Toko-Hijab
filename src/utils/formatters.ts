export const formatRupiah = (amount: number): string => {
  if (isNaN(amount) || amount === null || amount === undefined) return 'Rp 0';
  return 'Rp ' + amount.toLocaleString('id-ID');
};

export const formatDateTime = (dateStr: string | Date): string => {
  try {
    const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return String(dateStr);
  }
};

export const formatDate = (dateStr: string | Date): string => {
  try {
    const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return String(dateStr);
  }
};

export const generateInvoiceNumber = (count: number): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const seq = String(count).padStart(4, '0');
  return `TRX-${y}${m}${d}-${seq}`;
};

export const exportToCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
  const formatCell = (val: string | number) => {
    let str = val === null || val === undefined ? '' : String(val);
    str = str.replace(/"/g, '""');
    if (str.search(/("|,|\n)/g) >= 0) {
      str = `"${str}"`;
    }
    return str;
  };

  const csv =
    '\uFEFF' +
    [
      headers.map(formatCell).join(','),
      ...rows.map((row) => row.map(formatCell).join(',')),
    ].join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Membaca dan mengompres file gambar dari laptop menjadi base64 data URL
 * agar muat disimpan dengan aman di localStorage dan cepat ditampilkan.
 */
export const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDimension = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(dataUrl);
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

