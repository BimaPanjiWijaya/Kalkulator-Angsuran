"use client";

import { FormEvent, useMemo, useState } from "react";

type HasilAngsuran = {
  pokokUtang: number;
  bunga: number;
  angsuranPerBulan: number;
};

function formatRupiah(angka: number): string {
  return `Rp ${Math.round(angka).toLocaleString("id-ID")}`;
}

function hitungBunga(jangkaWaktu: number): number {
  if (jangkaWaktu <= 12) return 0.12;
  if (jangkaWaktu <= 24) return 0.14;
  return 0.165;
}

export default function Home() {
  const [otr, setOtr] = useState<string>("");
  const [dpPercent, setDpPercent] = useState<string>("");
  const [tenor, setTenor] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [hasil, setHasil] = useState<HasilAngsuran | null>(null);

  const bungaLabel = useMemo(() => {
    if (!hasil) return "-";
    return `${hasil.bunga * 100}%`;
  }, [hasil]);

  function hitungAngsuran(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const otrValue = Number(otr);
    const dpPercentValue = Number(dpPercent);
    const tenorValue = Number(tenor);

    if (!otrValue || !tenorValue || Number.isNaN(dpPercentValue)) {
      setError("Semua field wajib diisi ya, Boss!");
      setHasil(null);
      return;
    }

    if (otrValue <= 0 || tenorValue <= 0 || dpPercentValue < 0 || dpPercentValue > 100) {
      setError("Cek lagi input: OTR & tenor harus > 0, DP harus 0-100.");
      setHasil(null);
      return;
    }

    const dp = otrValue * (dpPercentValue / 100);
    const pokokUtang = otrValue - dp;
    const bunga = hitungBunga(tenorValue);
    const angsuranPerBulan = (pokokUtang + pokokUtang * bunga) / tenorValue;

    setError("");
    setHasil({ pokokUtang, bunga, angsuranPerBulan });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-10 text-slate-200">
      <main className="w-full max-w-[460px] rounded-xl bg-slate-800 p-7 shadow-2xl">
        <h1 className="text-xl font-bold text-sky-400">PT. INOVASI MITRA SEJATI</h1>
        <h2 className="mt-1 text-xl font-semibold text-sky-400">Kalkulator Angsuran Kredit</h2>

        <form className="mt-5" onSubmit={hitungAngsuran}>
          <label className="mt-3 block text-sm text-slate-400" htmlFor="otr">
            Harga OTR (Rp)
          </label>
          <input
            id="otr"
            type="number"
            inputMode="numeric"
            placeholder="contoh: 240000000"
            value={otr}
            onChange={(event) => setOtr(event.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-base outline-none ring-sky-400/50 transition focus:ring-2"
          />

          <label className="mt-3 block text-sm text-slate-400" htmlFor="dpPercent">
            Down Payment (%)
          </label>
          <input
            id="dpPercent"
            type="number"
            inputMode="decimal"
            placeholder="contoh: 20"
            value={dpPercent}
            onChange={(event) => setDpPercent(event.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-base outline-none ring-sky-400/50 transition focus:ring-2"
          />

          <label className="mt-3 block text-sm text-slate-400" htmlFor="tenor">
            Jangka Waktu (bulan)
          </label>
          <input
            id="tenor"
            type="number"
            inputMode="numeric"
            placeholder="contoh: 18"
            value={tenor}
            onChange={(event) => setTenor(event.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-base outline-none ring-sky-400/50 transition focus:ring-2"
          />

          {error ? <p className="mt-4 text-sm text-rose-400">{error}</p> : null}

          <button
            type="submit"
            className="mt-6 w-full cursor-pointer rounded-lg bg-sky-400 px-4 py-3 text-base font-bold text-slate-900 transition hover:bg-sky-500"
          >
            Hitung Angsuran
          </button>
        </form>

        {hasil ? (
          <section className="mt-6 rounded-lg border border-slate-700 bg-slate-900 p-4">
            <div className="flex items-center justify-between border-b border-slate-800 py-1.5 text-sm">
              <span>Pokok Utang</span>
              <span>{formatRupiah(hasil.pokokUtang)}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 py-1.5 text-sm">
              <span>Bunga</span>
              <span>{bungaLabel}</span>
            </div>
            <div className="mt-2 flex items-center justify-between py-1.5 text-base font-bold text-emerald-400">
              <span>Angsuran / Bulan</span>
              <span>{formatRupiah(hasil.angsuranPerBulan)}</span>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
