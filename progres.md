# Progres Website UMKM Desa Masaran

Dokumen ini adalah ringkasan kondisi proyek terbaru agar agent atau developer lain dapat melanjutkan pekerjaan tanpa kehilangan konteks.

Terakhir diperbarui: 28 Juli 2026

## Gambaran sistem

- Framework: Next.js (App Router), React, TypeScript, Tailwind CSS.
- Database, autentikasi, dan penyimpanan gambar: Supabase.
- Hosting target: Vercel.
- Ada dua peran pengguna:
  - **Admin** mengelola seluruh UMKM, kategori, dan data desa.
  - **UMKM** masuk menggunakan nomor WhatsApp dan password, lalu hanya dapat mengelola data UMKM miliknya sendiri.
- Admin masuk menggunakan username dan password.
- Foto disimpan pada Supabase Storage, bukan di server Vercel.

## Struktur data utama

- `umkm`: profil UMKM, informasi kontak, keunggulan, dan `slug`.
- `products`: produk yang dimiliki satu UMKM.
- `categories`: master kategori.
- `umkm_categories`: relasi banyak-ke-banyak antara UMKM dan kategori.
- `umkm_images`: logo serta gambar galeri UMKM.
- `desa`: data profil desa.
- `desa_images`: gambar Balai Desa dan galeri desa, termasuk kolom `deskripsi`.
- `profiles`: penghubung akun Supabase Auth dengan peran admin atau UMKM.

## Yang sudah selesai

### Fondasi Supabase dan autentikasi

- [x] Konfigurasi Supabase browser, server, admin, dan middleware/proxy.
- [x] Contoh environment variable tersedia pada `.env.example`.
- [x] Login admin dengan username/password.
- [x] Login UMKM dengan nomor WhatsApp/password.
- [x] Proteksi halaman admin berdasarkan peran pengguna.
- [x] Admin dapat membuat akun login UMKM dari form tambah UMKM.
- [x] Rancangan tabel, relasi, Storage bucket, dan RLS tersedia pada migration Supabase.

### Halaman admin

- [x] Layout admin terpisah dari layout guest dengan sidebar.
- [x] Dashboard admin dan dashboard UMKM dibedakan; kartu jumlah UMKM tetap tampil hanya untuk admin.
- [x] Daftar UMKM admin memakai data Supabase dan logo dari Storage bila tersedia.
- [x] Form tambah UMKM membuat data UMKM dan akun login terkait.
- [x] Manajemen UMKM menyimpan dan memuat data profil asli.
- [x] CRUD produk per UMKM, termasuk pencarian dan pagination maksimal 9 produk per halaman.
- [x] Pemilihan banyak kategori memakai `react-select` dan tersimpan pada relasi database.
- [x] Upload/ganti/hapus gambar UMKM: maksimal 4 gambar (Logo + Gambar 1--3), JPEG/JPG/PNG maksimal 2 MB.
- [x] CRUD kategori dengan pencarian, mode tambah/edit, hapus, dan pagination maksimal 10 data.
- [x] Seluruh input form data memiliki batas karakter di antarmuka serta validasi server; field harga dan RT/RW juga dibatasi ke angka.
- [x] Constraint panjang data untuk Supabase tersedia pada `supabase/migrations/20260729090000_add_form_length_constraints.sql`.
- [x] Manajemen data desa tersambung Supabase.
- [x] Upload Balai Desa dan Gambar Desa 1--6, deskripsi per gambar, simpan/batal, serta pratinjau gambar besar.

### Halaman guest

- [x] Beranda mengambil UMKM terbaru dan logo dari Supabase.
- [x] Daftar UMKM mengambil data dari Supabase.
- [x] Daftar produk mengambil produk dan UMKM terkait dari Supabase.
- [x] Detail UMKM memakai data Supabase, kategori, produk, dan galeri gambar.
- [x] Halaman Tentang Desa memakai data desa dan galeri dari Supabase.
- [x] Logo pada kartu UMKM menggunakan logo tersimpan; bila belum ada akan menampilkan placeholder “UMKM Desa Masaran”.
- [x] Gambar galeri UMKM dan desa dapat diklik untuk membuka popup layar penuh.
- [x] Popup gambar memakai komponen bersama `components/ImageLightbox.tsx`; gambar dipasang dengan elemen gambar biasa agar tidak lagi menjadi layar hitam.

### Slug URL UMKM

- [x] Detail UMKM tersedia pada route `/(guest)/umkm/[slug]`.
- [x] Slug baru dibuat dari nama UMKM, contoh `Keripik Bu Sri` menjadi `keripik-bu-sri`.
- [x] Bila nama sudah dipakai, slug baru menjadi `keripik-bu-sri-[id]`.
- [x] URL pada kartu guest sudah mengarah ke slug tersebut.
- [x] Migration untuk membersihkan slug lama tersedia pada `supabase/migrations/20260728090000_desa_image_descriptions_and_clean_slugs.sql`.

## Pekerjaan yang masih perlu dilakukan

### Wajib sebelum data produksi dipakai

- [ ] Jalankan migration SQL terbaru di Supabase bila belum dilakukan, terutama untuk:
  - menambah `desa_images.deskripsi`;
  - mengonversi slug lama ke format baru;
  - memastikan constraint slug memakai format slug dengan tanda hubung.
- [ ] Pastikan Storage bucket dan policy upload/baca sudah dibuat melalui migration atau SQL Dashboard Supabase.
- [ ] Isi environment variable Supabase pada Vercel saat deployment.
- [ ] Uji deployment production di Vercel setelah environment variable tersedia.

### Pengujian fungsional yang perlu dilakukan manual

- [ ] Uji login sebagai admin dan sebagai UMKM.
- [ ] Uji admin membuat UMKM baru, kemudian login memakai nomor WhatsApp dan password UMKM tersebut.
- [ ] Uji satu UMKM tidak dapat membuka atau mengubah data UMKM lain melalui URL.
- [ ] Uji tambah, ubah, dan hapus kategori, produk, gambar UMKM, serta gambar desa.
- [ ] Uji upload file tidak valid, file di atas 2 MB, dan penggantian gambar lama.
- [ ] Uji halaman guest saat data belum lengkap: tanpa logo, tanpa produk, tanpa galeri, dan tanpa deskripsi gambar.
- [ ] Uji semua link navigasi pada desktop dan layar ponsel.

### Penyempurnaan yang disarankan

- [ ] Tambahkan notifikasi sukses/gagal yang lebih konsisten pada seluruh form CRUD bila masih ada form yang hanya menampilkan pesan umum.
- [ ] Tambahkan halaman atau state kosong yang lebih informatif untuk daftar UMKM/produk/kategori tanpa data.
- [ ] Pertimbangkan pagination atau pencarian sisi server jika jumlah UMKM dan produk sudah besar.
- [ ] Tambahkan validasi server yang lebih lengkap untuk nomor WhatsApp, tautan media sosial, dan harga produk.
- [ ] Tambahkan fitur ubah password yang aman untuk admin maupun UMKM bila diperlukan.
- [ ] Tambahkan reset password melalui email/WhatsApp bila fitur ini dibutuhkan di masa depan.
- [ ] Buat halaman 404 yang lebih ramah untuk slug UMKM yang tidak ditemukan.
- [ ] Putuskan kebijakan perubahan slug: saat ini slug dibuat saat UMKM dibuat dan **tidak otomatis berubah ketika nama UMKM diubah**, agar tautan lama tidak rusak.

## Catatan penting Supabase

- Jangan pernah memasukkan `SUPABASE_SERVICE_ROLE_KEY` ke variabel dengan awalan `NEXT_PUBLIC_`.
- Hanya `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` yang boleh tersedia di browser.
- Gunakan service role hanya pada Server Action/server-side untuk membuat akun Auth atau operasi administratif.
- Gambar publik promosi dapat dibaca dari Storage; operasi tulis/hapus harus tetap dibatasi oleh policy dan pemeriksaan peran di server.
- Jika slug lama masih ada, jalankan SQL migration terbaru. Jangan memakai temporary slug dengan awalan garis bawah karena melanggar constraint `umkm_slug_format`.

## Berkas penting

| Keperluan | Lokasi |
| --- | --- |
| Dokumentasi progres ini | `progres.md` |
| Migration database awal | `supabase/migrations/20260726100000_initial_schema.sql` |
| Migration deskripsi gambar desa dan normalisasi slug | `supabase/migrations/20260728090000_desa_image_descriptions_and_clean_slugs.sql` |
| Detail UMKM guest | `components/UmkmDetail.tsx` |
| Manajemen UMKM | `components/UmkmManagement.tsx` |
| Manajemen desa | `components/DesaManagement.tsx` |
| Daftar UMKM admin | `components/AdminUmkmList.tsx` |
| Kartu UMKM | `components/UmkmCard.tsx` |
| Popup gambar bersama | `components/ImageLightbox.tsx` |
| Galeri desa guest | `components/DesaGallery.tsx` |
| Halaman Tentang Desa guest | `app/(guest)/tentang-desa/page.tsx` |

## Verifikasi terakhir

- TypeScript pernah berhasil diperiksa setelah perubahan fitur galeri dan CRUD terbaru.
- Tetap jalankan pemeriksaan ulang (`npx tsc --noEmit`) serta build production sebelum deploy, terutama setelah mengubah environment variable, migration, atau dependency.
