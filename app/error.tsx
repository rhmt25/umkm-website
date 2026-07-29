"use client";

import { useEffect } from "react";
import { CircleAlert, RefreshCw } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Application error handled:", error); }, [error]);
  return <main className="grid min-h-screen place-items-center bg-color2/40 p-5"><section className="w-full max-w-md rounded-2xl border border-color4 bg-color3 p-7 text-center shadow-sm"><CircleAlert className="mx-auto text-red-600" size={36} /><h1 className="mt-4 text-2xl font-bold">Terjadi gangguan</h1><p className="mt-2 text-sm text-color5/65">Halaman tidak dapat diproses saat ini. Silakan coba lagi.</p><button type="button" onClick={reset} className="mx-auto mt-6 inline-flex items-center gap-2 rounded-xl bg-color1 px-5 py-3 font-bold text-white"><RefreshCw size={18} /> Coba lagi</button></section></main>;
}
