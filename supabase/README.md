# Menyiapkan Supabase

1. Buat project baru di Supabase.
2. Pada SQL Editor, jalankan migration `migrations/20260726100000_initial_schema.sql`.
3. Pada **Auth > Providers**, aktifkan **Phone** untuk UMKM dan **Email** untuk akun admin. Admin tetap masuk dengan username pada UI; email internal hanya dipakai Supabase Auth.
4. Buat bucket `umkm-media` melalui migration. Bucket ini publik agar foto promosi dapat dilihat di halaman guest, sedangkan unggah/ganti/hapus tetap dibatasi oleh RLS.
5. Salin `.env.example` menjadi `.env.local`, lalu isi URL project, publishable key, dan service-role key. Jangan pernah menyimpan service-role key di frontend atau repository.

## Membuat admin pertama

Buat user email/password melalui **Authentication > Users**, memakai email internal misalnya `admin@auth.umkm.local`. Sesudah itu, jalankan query berikut di SQL Editor dan sesuaikan nilainya:

```sql
insert into public.profiles (id, role, username, login_email)
select id, 'admin', 'admin', email
from auth.users
where email = 'admin@auth.umkm.local';
```

Nantinya UI admin akan membuat akun UMKM (Phone + Password) sekaligus profil UMKM terkait. Password tidak disimpan di tabel `umkm`.
