-- UI limits are also enforced for every new or changed row in the database.
-- NOT VALID keeps this migration safe if an old imported row is longer; all new writes remain checked.

alter table public.umkm
  add constraint umkm_nama_length check (char_length(nama) <= 120) not valid,
  add constraint umkm_pemilik_length check (char_length(pemilik) <= 120) not valid,
  add constraint umkm_rt_length check (rt is null or char_length(rt) <= 3) not valid,
  add constraint umkm_rw_length check (rw is null or char_length(rw) <= 3) not valid,
  add constraint umkm_dukuh_length check (dukuh is null or char_length(dukuh) <= 100) not valid,
  add constraint umkm_dusun_length check (dusun is null or char_length(dusun) <= 100) not valid,
  add constraint umkm_alamat_length check (alamat_lengkap is null or char_length(alamat_lengkap) <= 500) not valid,
  add constraint umkm_no_wa_length check (char_length(no_wa) <= 20) not valid,
  add constraint umkm_instagram_length check (instagram is null or char_length(instagram) <= 100) not valid,
  add constraint umkm_tiktok_length check (tiktok is null or char_length(tiktok) <= 100) not valid,
  add constraint umkm_facebook_length check (facebook is null or char_length(facebook) <= 100) not valid,
  add constraint umkm_shopee_length check (shopee is null or char_length(shopee) <= 2048) not valid,
  add constraint umkm_tokopedia_length check (tokopedia is null or char_length(tokopedia) <= 2048) not valid,
  add constraint umkm_google_maps_length check (google_maps is null or char_length(google_maps) <= 2048) not valid,
  add constraint umkm_keunggulan1_length check (keunggulan1 is null or char_length(keunggulan1) <= 255) not valid,
  add constraint umkm_keunggulan2_length check (keunggulan2 is null or char_length(keunggulan2) <= 255) not valid,
  add constraint umkm_keunggulan3_length check (keunggulan3 is null or char_length(keunggulan3) <= 255) not valid,
  add constraint umkm_keunggulan4_length check (keunggulan4 is null or char_length(keunggulan4) <= 255) not valid;

alter table public.produk
  add constraint produk_nama_length check (char_length(nama) <= 120) not valid,
  add constraint produk_deskripsi_length check (deskripsi is null or char_length(deskripsi) <= 500) not valid,
  add constraint produk_harga_digits check (harga < 10000000000) not valid;

alter table public.kategori
  add constraint kategori_nama_length check (char_length(nama) <= 100) not valid;

alter table public.profiles
  add constraint profiles_username_length check (username is null or char_length(username) <= 50) not valid;

alter table public.desa
  add constraint desa_alamat_length check (alamat is null or char_length(alamat) <= 500) not valid,
  add constraint desa_telepon_length check (no_telepon is null or char_length(no_telepon) <= 20) not valid,
  add constraint desa_email_length check (email is null or char_length(email) <= 254) not valid,
  add constraint desa_tentang_length check (tentang is null or char_length(tentang) <= 5000) not valid,
  add constraint desa_google_maps_length check (google_maps is null or char_length(google_maps) <= 2048) not valid,
  add constraint desa_facebook_length check (facebook is null or char_length(facebook) <= 2048) not valid,
  add constraint desa_instagram_length check (instagram is null or char_length(instagram) <= 2048) not valid,
  add constraint desa_tiktok_length check (tiktok is null or char_length(tiktok) <= 2048) not valid,
  add constraint desa_youtube_length check (youtube is null or char_length(youtube) <= 2048) not valid;

alter table public.desa_images
  add constraint desa_images_deskripsi_length check (deskripsi is null or char_length(deskripsi) <= 255) not valid;
