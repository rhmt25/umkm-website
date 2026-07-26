# Progres Website UMKM Desa Masaran

Catatan ini adalah konteks kerja untuk melanjutkan pengembangan oleh agent lain.

## Todo list

| # | Tugas | Status |
|---|-------|--------|
| 1 | CRUD profil, produk, dan gambar di `UmkmManagement.tsx` | ✅ Selesai |
| 2 | CRUD admin Desa + semua gambar desa | ✅ Selesai |
| 3 | Daftar UMKM admin → Server Component + otorisasi UMKM | ✅ Selesai |
| 4 | Hubungkan semua halaman guest ke Supabase | ⬜ Belum |
| 5 | Uji hak akses, upload, login, pagination | ⬜ Belum |
| 6 | UI loading/error/sukses yang ramah (form tambah UMKM) | ⬜ Belum |
| 7 | Verifikasi: `tsc`, lint, `npm run build` | ⬜ Belum |
| 8 | Deploy ke Vercel dengan environment variable | ⬜ Belum |
| 9 | Perbaiki login UMKM nomor HP | ✅ Selesai |

## Tujuan aplikasi

Website promosi UMKM Desa Masaran dengan dua jenis pengguna:

- **Admin**: mengelola seluruh UMKM, kategori, data desa, produk, dan foto.
- **UMKM**: masuk dengan nomor HP serta password, lalu hanya mengelola profil, kategori, produk, dan fotonya sendiri.
- **Guest/pengunjung**: melihat daftar UMKM, detail UMKM, produk, dan informasi desa.

Stack yang dipakai:

- Next.js 16.2.10, React 19, TypeScript, Tailwind CSS 4.
- Supabase: Auth, PostgreSQL, Storage, dan RLS.
- Vercel: target deployment.

## Keputusan penting

- Admin membuat akun UMKM; tidak ada pendaftaran UMKM mandiri.
- UMKM login memakai **nomor HP + password**.
- Admin terlihat login dengan **username + password**. Secara internal akun admin memakai email Supabase Auth, misalnya `admin@auth.umkm.local`.
- Password **tidak boleh** disimpan pada tabel `umkm` atau tabel admin biasa. Password dikelola Supabase Auth.
- Foto promosi disimpan di **Supabase Storage**, bukan Vercel.
- Bucket media bernama `umkm-media`, bersifat publik untuk ditampilkan di halaman guest. Unggah/ganti/hapus dibatasi melalui RLS.
- Foto per UMKM maksimal **4 slot**: `logo`, `gambar_1`, `gambar_2`, `gambar_3`.
- Gambar desa: 1 balai desa (`desa.balai_desa_path`) + 6 galeri (`desa_images` urutan 1–6).
- Gambar hanya JPEG/JPG/PNG maksimal 2 MB.
- Kolom jam operasional sudah dihilangkan dari form frontend dan tidak digunakan.
- Upload gambar desa memakai **admin client** (service-role) karena RLS Storage saat ini hanya mengizinkan path `umkm/<id>/` untuk user authenticated.

## Konfigurasi Supabase

File yang relevan:

- `.env.example`: contoh environment variable.
- `.env.local`: dibuat pengguna secara lokal dan tidak boleh di-commit.
- `supabase/migrations/20260726100000_initial_schema.sql`: migration utama.
- `supabase/README.md`: petunjuk setup project dan admin awal.

Environment yang dibutuhkan:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=...
```

Catatan URL: URL Supabase harus root project, bukan endpoint REST. Kode juga sudah menormalisasi URL yang berakhiran `/rest/v1/`.

Jangan pernah menaruh `SUPABASE_SERVICE_ROLE_KEY` di Client Component, kode browser, Git, atau chat.

## Skema database yang dibuat

Migration membuat tabel berikut:

- `profiles`: role `admin` / `umkm`, username dan email internal admin.
- `umkm`: profil usaha dengan `user_id` ke `profiles.id`.
- `kategori`.
- `umkm_kategori`: relasi banyak-ke-banyak UMKM dan kategori.
- `produk`: relasi ke `umkm` melalui `id_umkm`.
- `umkm_images`: path Storage untuk logo + 3 gambar.
- `desa`: satu data profil desa.
- `desa_images`: gambar balai desa + 6 gambar galeri.

Migration juga membuat:

- RLS untuk data publik, admin, dan UMKM pemilik.
- Bucket `umkm-media` dengan batas 2 MB dan MIME type JPEG/PNG.
- Helper database `is_admin`, `owns_umkm`, dan `can_manage_umkm_storage`.

## Struktur koneksi Supabase

- `lib/supabase/client.ts`: client browser. Harus memakai akses langsung `process.env.NEXT_PUBLIC_*` agar variabel masuk ke bundle browser.
- `lib/supabase/server.ts`: client Server Component/Server Action menggunakan cookies.
- `lib/supabase/admin.ts`: client service-role untuk provisioning akun. Server-only secara penggunaan; jangan impor di Client Component.
- `lib/supabase/proxy.ts` dan `proxy.ts`: refresh sesi Supabase untuk `/admin/*` dan `/masuk`.

## Yang sudah berfungsi dengan Supabase

### Autentikasi

- Halaman `app/(guest)/masuk/page.tsx` menerima nomor HP atau username + password.
- Action `app/(guest)/masuk/actions.ts`:
  - Nomor HP: login Supabase dengan phone/password.
  - Username admin: mencari `profiles.login_email` dengan service-role lalu login email/password.
  - Admin diarahkan ke `/admin`.
  - UMKM diarahkan ke `/admin/umkm/[id]` miliknya.
- `app/admin/layout.tsx` memeriksa sesi dan role.
- Sidebar menampilkan menu berbeda untuk admin dan UMKM.

### Dashboard

- `app/admin/page.tsx` menghitung total UMKM, kategori, dan produk dari database.
- Kartu **Total UMKM** hanya muncul bagi admin.
- Dashboard UMKM tidak menampilkan kartu Total UMKM.

### Kategori admin

- `app/admin/kategori/page.tsx` mengambil kategori dari tabel `kategori`.
- `components/CategoryManager.tsx` menyediakan pencarian dan pagination 10 item.
- `app/admin/kategori/actions.ts` menyediakan tambah, edit, hapus kategori dengan validasi role admin.
- Penghapusan kategori akan gagal bila masih digunakan oleh UMKM karena foreign key database.

### Tambah UMKM

- `app/admin/umkm/tambah/actions.ts` membuat:
  1. User Supabase Auth phone/password (`phone_confirm: true`, tanpa SMS).
  2. Profil role `umkm`.
  3. Baris profil pada tabel `umkm`.
  4. Slug unik.
- Jika tahap berikutnya gagal, action berusaha membersihkan user/profil yang baru dibuat.
- Sesudah berhasil, admin diarahkan ke `/admin/umkm/[id]`.

### Daftar UMKM admin

- `app/admin/umkm/page.tsx` tidak lagi memakai array UMKM dummy.
- Mengambil data `umkm`, kategori relasi, dan logo dari Supabase.
- Pencarian/pagination masih dikelola di client setelah data diambil.

### Manajemen UMKM (CRUD penuh)

- `app/admin/umkm/[id]/page.tsx` memuat profil UMKM, produk, kategori, dan gambar dari Supabase.
- User UMKM tidak bisa membuka UMKM milik orang lain (`notFound()`).
- `app/admin/umkm/[id]/actions.ts`:
  - `updateUmkmProfile` — update tabel `umkm`, password, dan nomor HP Auth.
  - `createProduct` / `updateProduct` / `deleteProduct` — CRUD produk.
  - `uploadUmkmImage` / `deleteUmkmImage` — upload/hapus ke Storage `umkm-media`, upsert `umkm_images`.
  - `updateUmkmCategories` — sinkron relasi kategori dengan error handling.
- `components/UmkmManagement.tsx` — form profil, kategori, gambar, dan produk terhubung ke Server Actions dengan loading/error/sukses.

### Halaman Desa admin (CRUD penuh)

- `app/admin/desa/page.tsx` — Server Component, hanya role admin (`redirect` jika bukan admin).
- `app/admin/desa/actions.ts`:
  - `updateDesaProfile` — simpan ke tabel `desa` (`id = 1`).
  - `uploadBalaiDesaImage` / `deleteBalaiDesaImage` — balai desa ke `desa.balai_desa_path`.
  - `uploadDesaGalleryImage` / `updateDesaGalleryDescription` / `deleteDesaGalleryImage` — galeri urutan 1–6 ke `desa_images`.
  - Upload Storage memakai admin client (path `desa/...`) karena RLS Storage belum mencakup path desa.
- `components/DesaManagement.tsx` — UI client dengan loading/error/sukses, preview gambar, hapus gambar.

## Bagian yang BELUM selesai / masih dummy

### 1. Halaman guest masih dummy

File yang masih perlu dihubungkan:

- `app/(guest)/page.tsx` (beranda).
- `app/(guest)/umkm/page.tsx` (daftar UMKM; masih `umkmData` dummy).
- `components/UmkmDetail.tsx` (profil, galeri, manfaat, dan produk masih dummy).
- `app/(guest)/produk/page.tsx` (produk masih dummy).
- `app/(guest)/tentang-desa/page.tsx` (data desa dan galeri masih dummy).

Target:

- Jadikan page Server Component yang mengambil data Supabase.
- Halaman detail memakai slug dari tabel `umkm`.
- Gunakan `umkm_images` untuk logo/galeri; gunakan `produk` untuk daftar produk maksimal 12 per halaman.
- Gunakan `desa` dan `desa_images` untuk Tentang Desa.
- Pencarian/filter dapat memakai `searchParams` di server atau client setelah menerima data nyata.

### 2. Daftar UMKM admin perlu penyempurnaan

- Sudah mengambil data nyata, tetapi masih query di Client Component.
- Lebih baik pindahkan query ke Server Component atau server data layer agar tidak bergantung pada public key di browser dan lebih mudah menangani error/loading.
- Tambahkan penanganan error dari Supabase; saat ini kode terutama menangani data kosong.

### 3. Form tambah UMKM perlu penyempurnaan

- Foto belum diunggah langsung pada form tambah. Saat ini foto diunggah setelah redirect ke Manajemen UMKM; ini adalah keputusan sementara yang aman karena ID UMKM sudah tersedia.
- Tambahkan tampilan pesan error yang ramah (`useActionState`) daripada error Server Action mentah.
- Tambahkan pilihan kategori saat tambah UMKM, atau biarkan pengguna memilih sesudah dibuat di manajemen UMKM (saat ini pendekatan kedua).
- Pastikan field wajib memiliki atribut `required` pada UI, terutama nama, pemilik, nomor WA, dan password.

## Urutan lanjutan yang disarankan

1. ~~Selesaikan CRUD profil, produk, dan gambar di `UmkmManagement.tsx`.~~ ✅
2. ~~Selesaikan CRUD admin Desa + semua gambar desa.~~ ✅
3. Ubah daftar UMKM admin menjadi server data fetch dan perbaiki otorisasi user UMKM.
4. Hubungkan semua halaman guest ke Supabase dan hapus seluruh dummy data.
5. Uji hak akses (admin vs UMKM), upload, ganti/hapus gambar, login, dan pagination.
6. Tambahkan UI loading/error/sukses yang ramah (form tambah UMKM).
7. Jalankan `npx.cmd tsc --noEmit`, lint, dan `npm run build`.
8. Deploy ke Vercel: tambahkan tiga environment variable di Project Settings untuk Development, Preview, dan Production. Jangan deploy service-role key ke client; Vercel menyimpan environment server-side.

## Catatan masalah yang pernah terjadi

- Error `NEXT_PUBLIC_SUPABASE_URL belum diatur` di browser terjadi karena `client.ts` sebelumnya mengakses environment dengan key dinamis (`process.env[name]`). Next.js tidak memasukkan pola dinamis ke bundle browser. Sudah diperbaiki menjadi akses langsung `process.env.NEXT_PUBLIC_SUPABASE_URL`.
- Jika `.env.local` diubah, server `npm run dev` harus dihentikan lalu dijalankan kembali.
- User mungkin belum memiliki data UMKM; kondisi kosong harus menampilkan pesan normal, bukan error.
- RLS Storage bucket `umkm-media` hanya mengizinkan upload path `umkm/<id>/` via `can_manage_umkm_storage`. Upload gambar desa (path `desa/...`) memakai admin client di Server Action setelah verifikasi role admin.

## Verifikasi terakhir

- `npx.cmd tsc --noEmit` berhasil setelah CRUD Desa (27 Jul 2026).
- Tidak ada migration yang dijalankan otomatis dari agent; migration dijalankan pengguna melalui SQL Editor Supabase.
