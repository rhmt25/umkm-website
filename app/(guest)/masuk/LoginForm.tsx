"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, ShieldCheck } from "lucide-react";
import { FORM_LIMITS } from "@/lib/form-limits";
import { useToast } from "@/components/ToastProvider";
import PasswordInput from "@/components/PasswordInput";

type LoginState = { error?: string; redirectUrl?: string };

export default function LoginForm({
  loginAction,
}: {
  loginAction: (prevState: LoginState, formData: FormData) => Promise<LoginState>;
}) {
  const router = useRouter();
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<LoginState>({});
  const [isPending, setIsPending] = useState(false);
  const { showToast } = useToast();
  const errorCountRef = useRef(0);

  useEffect(() => {
    if (state.error) {
      errorCountRef.current += 1;
      showToast(state.error, "error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    try {
      const result = await loginAction({}, formData);
      if (result.redirectUrl) {
        showToast("Berhasil masuk! Mengarahkan ke panel...", "success", "Berhasil Masuk");
        router.push(result.redirectUrl);
        router.refresh();
        return;
      }
      setState({ ...result });
    } catch {
      setState({
        error:
          "Gagal Masuk\nPenyebab: Gangguan koneksi ke server.\nSolusi: Periksa jaringan Anda dan coba lagi.",
      });
    } finally {
      setIsPending(false);
    }
  }

  const hasIdentityError = !identity.trim() && Boolean(state.error);
  const hasPasswordError = !password && Boolean(state.error);

  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-color2/40 px-4 py-12 sm:px-6">
      <section className="w-full max-w-md overflow-hidden rounded-3xl border border-color4/80 bg-color3 shadow-xl shadow-color5/10">
        <div className="bg-color1 px-5 py-7 text-center text-color3 sm:px-10">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-color3 text-color1">
            <ShieldCheck size={29} />
          </span>
          <h1 className="mt-4 text-2xl font-bold">Masuk Pengelola</h1>
          <p className="mt-2 text-sm text-color3/75">Masuk sebagai admin atau pemilik UMKM.</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit(new FormData(e.currentTarget));
          }}
          className="space-y-5 p-5 sm:p-10"
        >
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-color5">
              Nomor HP atau Username <span className="text-red-500">*</span>
            </span>
            <div className="relative">
              <Phone
                className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                  hasIdentityError ? "text-red-500" : "text-color5/45"
                }`}
                size={19}
              />
              <input
                type="text"
                name="identity"
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                maxLength={FORM_LIMITS.username}
                autoComplete="username"
                placeholder="Contoh: 0812-3456-7890 atau admin"
                required
                className={`h-12 w-full rounded-xl border bg-color3 pl-11 pr-4 outline-none transition ${
                  hasIdentityError
                    ? "border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-2 focus:ring-red-500/15"
                    : "border-color4 focus:border-color1 focus:ring-2 focus:ring-color1/15"
                }`}
              />
            </div>
            <span className="mt-2 block text-xs text-color5/55">
              Maksimal {FORM_LIMITS.username} karakter.
            </span>
          </label>

          <PasswordInput
            label="Password"
            isRequired
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            maxLength={FORM_LIMITS.password}
            placeholder="Masukkan password Anda"
            error={hasPasswordError}
            hint={`Maksimal ${FORM_LIMITS.password} karakter.`}
          />

          <button
            type="submit"
            disabled={isPending}
            className="mt-2 h-12 w-full rounded-xl bg-color1 font-bold text-white shadow-sm transition hover:bg-color1/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </section>
    </main>
  );
}
