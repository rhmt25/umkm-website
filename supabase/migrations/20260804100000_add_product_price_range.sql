-- Migration: Tambah dukungan rentang harga (price range) pada tabel produk
ALTER TABLE public.produk
  ADD COLUMN IF NOT EXISTS is_range boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS harga_max numeric(12, 2) DEFAULT NULL;

-- Constraint opsional untuk memastikan batas maksimal harga >= harga minimal saat mode rentang aktif
ALTER TABLE public.produk
  DROP CONSTRAINT IF EXISTS produk_harga_range_check;

ALTER TABLE public.produk
  ADD CONSTRAINT produk_harga_range_check
  CHECK (
    (is_range = false) OR 
    (is_range = true AND harga_max IS NOT NULL AND harga_max >= harga)
  );
