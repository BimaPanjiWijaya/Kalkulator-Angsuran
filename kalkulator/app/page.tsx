"use client";

import { FormEvent, useMemo, useState } from "react";

type HasilAngsuran = {
  dpNominal: number;
  pokokUtang: number;
  bunga: number;
  totalPembayaran: number;
  angsuranPerBulan: number;
};

function formatRupiah(angka: number): string {
  return `Rp ${Math.round(angka).toLocaleString("id-ID")}`;
}

function ambilDigit(value: string): string {
  return value.replace(/\D/g, "");
}

function formatDigitDenganPemisah(value: string): string {
  if (!value) return "";
  return Number(value).toLocaleString("id-ID");
}

function parseInputRupiah(value: string): number {
  const hanyaDigit = ambilDigit(value);
  if (!hanyaDigit) return 0;
  return Number(hanyaDigit);
}

function hitungBunga(jangkaWaktu: number): number {
  if (jangkaWaktu <= 12) return 0.12;
  if (jangkaWaktu <= 24) return 0.14;
  return 0.165;
}

export default function Home() {
  const [otrInput, setOtrInput] = useState<string>("");
  const [dpPercentInput, setDpPercentInput] = useState<string>("");
  const [tenorInput, setTenorInput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [hasil, setHasil] = useState<HasilAngsuran | null>(null);

  const bungaLabel = useMemo(() => {
    if (!hasil) return "-";
    return `${(hasil.bunga * 100).toFixed(1).replace(".0", "")}%`;
  }, [hasil]);

  function handleOtrChange(value: string): void {
    const hanyaDigit = ambilDigit(value);
    setOtrInput(formatDigitDenganPemisah(hanyaDigit));
  }

  function hitungAngsuran(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const otrValue = parseInputRupiah(otrInput);
    const dpPercentValue = Number(dpPercentInput);
    const tenorValue = Number(tenorInput);

    if (!otrValue || !tenorValue || Number.isNaN(dpPercentValue)) {
      setError("Semua field wajib diisi ya, Boss!");
      setHasil(null);
      return;
    }

    if (
      otrValue <= 0 ||
      tenorValue <= 0 ||
      dpPercentValue < 0 ||
      dpPercentValue > 100
    ) {
      setError("Cek lagi input: OTR & tenor harus > 0, DP harus 0-100.");
      setHasil(null);
      return;
    }

    const dpNominal = otrValue * (dpPercentValue / 100);
    const pokokUtang = otrValue - dpNominal;
    const bunga = hitungBunga(tenorValue);
    const totalPembayaran = pokokUtang + pokokUtang * bunga;
    const angsuranPerBulan = totalPembayaran / tenorValue;

    setError("");
    setHasil({
      dpNominal,
      pokokUtang,
      bunga,
      totalPembayaran,
      angsuranPerBulan,
    });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b1220] px-4 py-10 text-slate-100">
      <div className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-cyan-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-10 h-80 w-80 rounded-full bg-emerald-400/15 blur-3xl" />

      <main className="relative w-full max-w-[520px] rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-7 shadow-[0_18px_60px_rgba(2,10,29,0.55)] backdrop-blur">
        <div className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
          IMS Finance
        </div>

        <h1 className="mt-4 text-center text-2xl font-black tracking-tight text-white sm:text-3xl">
          Kalkulator Angsuran Kredit
        </h1>
        <p className="mt-2 text-center text-sm text-slate-300">
          Hitung simulasi cicilan kendaraan dengan cepat dan akurat.
        </p>

        <form className="mt-6 space-y-4" onSubmit={hitungAngsuran}>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300" htmlFor="otr">
              Harga OTR
            </label>
            <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900/80 px-3 focus-within:border-cyan-300/70 focus-within:ring-2 focus-within:ring-cyan-300/20">
              <span className="pr-2 text-sm font-semibold text-cyan-200">Rp</span>
              <input
                id="otr"
                type="text"
                inputMode="numeric"
                placeholder="240.000.000"
                value={otrInput}
                onChange={(event) => handleOtrChange(event.target.value)}
                className="w-full bg-transparent py-3 text-base text-slate-100 outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300" htmlFor="dpPercent">
              Down Payment (%)
            </label>
            <input
              id="dpPercent"
              type="number"
              min={0}
              max={100}
              inputMode="decimal"
              placeholder="20"
              value={dpPercentInput}
              onChange={(event) => setDpPercentInput(event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-3 text-base outline-none ring-cyan-300/20 placeholder:text-slate-500 focus:border-cyan-300/70 focus:ring-2"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300" htmlFor="tenor">
              Jangka Waktu (bulan)
            </label>
            <input
              id="tenor"
              type="number"
              min={1}
              inputMode="numeric"
              placeholder="18"
              value={tenorInput}
              onChange={(event) => setTenorInput(event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-3 text-base outline-none ring-cyan-300/20 placeholder:text-slate-500 focus:border-cyan-300/70 focus:ring-2"
            />
          </div>

          {error ? (
            <p className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-cyan-300 to-emerald-300 px-4 py-3 text-base font-black tracking-wide text-slate-900 transition hover:brightness-105"
          >
            Hitung Angsuran
          </button>
        </form>

        {hasil ? (
          <section className="mt-6 rounded-2xl border border-slate-700/80 bg-slate-950/80 p-4">
            <div className="flex items-center justify-between border-b border-slate-800 py-2 text-sm">
              <span className="text-slate-300">DP Nominal</span>
              <span className="font-semibold text-slate-100">{formatRupiah(hasil.dpNominal)}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 py-2 text-sm">
              <span className="text-slate-300">Pokok Utang</span>
              <span className="font-semibold text-slate-100">{formatRupiah(hasil.pokokUtang)}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 py-2 text-sm">
              <span className="text-slate-300">Bunga</span>
              <span className="font-semibold text-slate-100">{bungaLabel}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 py-2 text-sm">
              <span className="text-slate-300">Total Pembayaran</span>
              <span className="font-semibold text-slate-100">{formatRupiah(hasil.totalPembayaran)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between py-2 text-lg font-black text-emerald-300">
              <span>Angsuran / Bulan</span>
              <span>{formatRupiah(hasil.angsuranPerBulan)}</span>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
