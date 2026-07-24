"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff, LockKeyhole, Phone, ShieldCheck } from "lucide-react";

export default function Page() {
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-color2/40 px-4 py-12 sm:px-6">
      <section className="w-full max-w-md overflow-hidden rounded-3xl border border-color4/80 bg-color3 shadow-xl shadow-color5/10">
        <div className="bg-color1 px-7 py-8 text-center text-color3 sm:px-10">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-color3 text-color1"><ShieldCheck size={29} /></span>
          <h1 className="mt-4 text-2xl font-bold">Masuk Admin</h1>
          <p className="mt-2 text-sm text-color3/75">Kelola data UMKM Desa Masaran.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 p-7 sm:p-10">
          <label className="block"><span className="mb-2 block text-sm font-semibold">Nomor HP</span><div className="relative"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-color5/45" size={19} /><input type="tel" name="phone" inputMode="tel" placeholder="Contoh: 0812-3456-7890" required className="h-12 w-full rounded-xl border border-color4 bg-color3 pl-11 pr-4 outline-none transition focus:border-color1 focus:ring-2 focus:ring-color1/15" /></div></label>
          <label className="block"><span className="mb-2 block text-sm font-semibold">Password</span><div className="relative"><LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-color5/45" size={19} /><input type={showPassword ? "text" : "password"} name="password" placeholder="Masukkan password" required className="h-12 w-full rounded-xl border border-color4 bg-color3 pl-11 pr-12 outline-none transition focus:border-color1 focus:ring-2 focus:ring-color1/15" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"} className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-color5/50 transition hover:bg-color4/70 hover:text-color1">{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div></label>
          <button type="submit" className="mt-2 h-12 w-full rounded-xl bg-color1 font-bold text-white shadow-sm transition hover:bg-color1/90">Masuk</button>
        </form>
      </section>
    </main>
  );
}
