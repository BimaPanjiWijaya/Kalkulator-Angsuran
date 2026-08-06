"use client";

import { useState, useMemo, FormEvent, useEffect } from "react";

type RincianBulanan = {
  bulanKe: number;
  angsuran: number;
};

type HasilAngsuran = {
  dpNominal: number;
  pokokUtang: number;
  bunga: number;
  bungaDalamRupiah: number;
  totalPembayaran: number;
  angsuranPerBulan: number;
  rincian: RincianBulanan[];
};

function formatRupiah(angka: number) {
  return `Rp ${Math.round(angka).toLocaleString("id-ID")}`;
}

function ambilDigit(value: string) {
  return value.replace(/\D/g, "");
}

function formatDigitDenganPemisah(value: string) {
  if (!value) return "";
  return Number(value).toLocaleString("id-ID");
}

function parseInputRupiah(value: string) {
  const hanyaDigit = ambilDigit(value);
  if (!hanyaDigit) return 0;
  return Number(hanyaDigit);
}

const TIER_BUNGA = [
  { maksTenor: 12, bunga: 0.12 },
  { maksTenor: 24, bunga: 0.14 },
  { maksTenor: 36, bunga: 0.165 },
];
const BUNGA_DEFAULT = 0.18;

function hitungBunga(jangkaWaktu: number) {
  const tier = TIER_BUNGA.find((t) => jangkaWaktu <= t.maksTenor);
  return tier ? tier.bunga : BUNGA_DEFAULT;
}

function validasiInput(
  otrValue: number,
  tenorValue: number,
  dpPercentInput: string,
  dpPercentValeu: number,
): string | null {
  if (!otrValue || !tenorValue || !dpPercentInput) {
    return "Semua field wajib diisi!";
  }
  if (Number.isNaN(dpPercentValeu)) {
    return "Tidak Boleh Menggunakan Huruf";
  }
  if (
    otrValue <= 0 ||
    tenorValue <= 0 ||
    dpPercentValeu < 0 ||
    dpPercentValeu > 100
  ) {
    return "Cek lagi input: OTR & tenor harus lebih 0, DP harus 0 - 100";
  }
  if (tenorValue > 60) {
    return "Tidak Boleh lebih dari 60 bulan";
  }
  return null;
}

export default function Home() {
  const [otrInput, setOtrInput] = useState("");
  const [dpPercentInput, setDpPercentInput] = useState("");
  const [tenorInput, setTenorInput] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsloading] = useState(false);
  const [hasil, setHasil] = useState<HasilAngsuran | null>(null);
  const [metodePembayaran, setMetodePembayaran] = useState<"Cash" | "Kredit">(
    "Kredit",
  );

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => {
      setError("");
    }, 2000);
    return () => clearTimeout(timer);
  }, [error]);

  const bungaLabel = useMemo(() => {
    if (!hasil) return "-";
    return `${(hasil.bunga * 100).toFixed(1).replace(".0", "")}%`;
  }, [hasil]);

  function handleOtrChange(value: string) {
    const hanyaDigit = ambilDigit(value);
    setOtrInput(formatDigitDenganPemisah(hanyaDigit));
  }

  function resetForm() {
    setOtrInput("");
    setDpPercentInput("");
    setTenorInput("");
    setHasil(null);
    setError("");
  }

  function hitungAngsuran(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsloading(true);
    setTimeout(() => {
      const otrValue = parseInputRupiah(otrInput);
      if (metodePembayaran === "Cash") {
        if (!otrValue || otrValue <= 0) {
          setError("OTR wajib diisi");
          setHasil(null);
          setIsloading(false);
          return;
        }
        setError("");
        setHasil({
          dpNominal: 0,
          pokokUtang: otrValue,
          bunga: 0,
          bungaDalamRupiah: 0,
          totalPembayaran: otrValue,
          angsuranPerBulan: 0,
          rincian: [],
        });
        setIsloading(false);
        return;
      }
      const dpPercentValeu = Number(dpPercentInput);
      const tenorValue = Number(tenorInput);

      const pesanError = validasiInput(
        otrValue,
        tenorValue,
        dpPercentInput,
        dpPercentValeu,
      );
      if (pesanError) {
        setError(pesanError);
        setHasil(null);
        setIsloading(false);
        return;
      }

      const dpNominal = otrValue * (dpPercentValeu / 100);
      const pokokUtang = otrValue - dpNominal;
      const bunga = hitungBunga(tenorValue);
      const bungaDalamRupiah = bunga * pokokUtang;
      const totalPembayaran = pokokUtang + pokokUtang * bunga;
      const angsuranPerBulan = totalPembayaran / tenorValue;

      const rincian: RincianBulanan[] = Array.from(
        { length: tenorValue },
        (_, i) => ({
          bulanKe: i + 1,
          angsuran: angsuranPerBulan,
        }),
      );
      setError("");
      setHasil({
        dpNominal,
        pokokUtang,
        bunga,
        bungaDalamRupiah,
        totalPembayaran,
        angsuranPerBulan,
        rincian,
      });
      setIsloading(false);
    }, 500);
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
          <div className="flex gap-2 rounded-xl border border-slate-700 bg-slate-900/80 p-1">
            <button
              type="button"
              onClick={() => {
                setMetodePembayaran("Kredit");
                setOtrInput("");
                setDpPercentInput("");
                setTenorInput("");
                setHasil(null);
                setError("");
              }}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold ${
                metodePembayaran === "Kredit"
                  ? "bg-cyan-400 text-slate-900"
                  : "text-slate-300"
              }`}
            >
              Kredit
            </button>
            <button
              type="button"
              onClick={() => {
                setMetodePembayaran("Cash");
                setOtrInput("");
                setDpPercentInput("");
                setTenorInput("");
                setHasil(null);
                setError("");
              }}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold ${
                metodePembayaran === "Cash"
                  ? "bg-cyan-400 text-slate-900"
                  : "text-slate-300"
              }`}
            >
              Cash
            </button>
          </div>

          <div>
            <label
              className="mb-1.5 block text-sm font-medium text-slate-300"
              htmlFor="otr"
            >
              Harga OTR
            </label>
            <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900/80 px-3 focus-within:border-cyan-300/70 focus-within:ring-2 focus-within:ring-cyan-300/20">
              <span className="pr-2 text-sm font-semibold text-cyan-200">
                Rp
              </span>
              <input
                id="otr"
                type="text"
                inputMode="numeric"
                placeholder="xxx.xxx.xxx"
                value={otrInput}
                onChange={(e) => handleOtrChange(e.target.value)}
                className="w-full bg-transparent py-3 text-base text-slate-100 outline-none placeholder:text-slate-500"
              />
            </div>
          </div>
          {metodePembayaran === "Kredit" && (
            <>
              <div>
                <label
                  className="mb-1.5 block text-sm font-medium text-slate-300"
                  htmlFor="dpPercent"
                >
                  Down Payment (%)
                </label>
                <input
                  id="dpPercent"
                  type="text"
                  min={0}
                  max={100}
                  inputMode="numeric"
                  placeholder="xxx"
                  value={dpPercentInput}
                  onChange={(e) => setDpPercentInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-3 text-base outline-none ring-cyan-300/20 placeholder:text-slate-500 focus:border-cyan-300/70 focus:ring-2"
                />
              </div>

              <div>
                <label
                  className="mb-1.5 block text-sm font-medium text-slate-300"
                  htmlFor="tenor"
                >
                  Jangka Waktu (bulan)
                </label>
                <input
                  id="tenor"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  placeholder="xxx"
                  value={tenorInput}
                  onChange={(e) => setTenorInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-3 text-base outline-none ring-cyan-300/20 placeholder:text-slate-500 focus:border-cyan-300/70 focus:ring-2"
                />
              </div>
            </>
          )}

          {error ? (
            <p className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={resetForm}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-300 to-emerald-300 px-4 py-3 text-base font-black tracking-wide text-slate-900 transition hover:brightness-105"
          >
            {isLoading ? "Menghitung..." : "Hitung Angsuran"}
          </button>
        </form>

        {hasil ? (
          <section className="mt-6 rounded-2xl border border-slate-700/80 bg-slate-950/80 p-4">
            <div className="flex items-center justify-between border-b border-slate-800 py-2 text-sm">
              <span className="text-slate-300">DP Nominal</span>
              <span className="font-semibold text-slate-100">
                {formatRupiah(hasil.dpNominal)}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 py-2 text-sm">
              <span className="text-slate-300">Pokok Utang</span>
              <span className="font-semibold text-slate-100">
                {formatRupiah(hasil.pokokUtang)}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 py-2 text-sm">
              <span className="text-slate-300">Bunga</span>
              <span className="font-semibold text-slate-100">{bungaLabel}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 py-2 text-sm">
              <span className="text-slate-300">Bunga Dalam Rupiah</span>
              <span className="font-semibold text-slate-100">
                {formatRupiah(hasil.bungaDalamRupiah)}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 py-2 text-sm">
              <span className="text-slate-300">Total Pembayaran</span>
              <span className="font-semibold text-slate-100">
                {formatRupiah(hasil.totalPembayaran)}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between py-2 text-lg font-black text-emerald-300">
              <span>
                {metodePembayaran === "Cash"
                  ? "Total Bayar"
                  : "Angsuran / Bulan"}
              </span>
              <span>
                {formatRupiah(
                  metodePembayaran === "Cash"
                    ? hasil.pokokUtang
                    : hasil.angsuranPerBulan,
                )}
              </span>
            </div>
            {hasil.rincian.length > 0 && (
              <div className="mt-4 max-h-48 overflow-y-auto rounded-xl border border-slate-800">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-slate-900">
                    <tr>
                      <th className="px-3 py-2 text-left text-slate-400">
                        Bulan Ke
                      </th>
                      <th className="px-3 py-2 text-right text-slate-400">
                        Angsuran
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {hasil.rincian.map((r) => (
                      <tr key={r.bulanKe} className="border-t border-slate-800">
                        <td className="px-3 py-2 text-slate-300">
                          {r.bulanKe}
                        </td>
                        <td className="px-3 py-2 text-right text-slate-100">
                          {formatRupiah(r.angsuran)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : null}
      </main>
    </div>
  );
}
