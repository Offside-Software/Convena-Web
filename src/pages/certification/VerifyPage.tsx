
import React, { useState } from "react";
import {
  CheckCircle2,
  QrCode,
  XCircle,
  Search,
  ArrowRight,
} from "lucide-react";

import { certificateService } from "../../services/certificate.service.ts";
import type { Certificate } from "../../types/certificate.ts";

export const VerifyPage: React.FC = () => {
  const [code, setCode] = useState("CNV-2026-ITB-8821");
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  // Proses verifikasi sertifikat
  const performVerification = async (certCode: string) => {
    if (!certCode.trim()) return;

    setLoading(true);
    setHasSearched(false);
    setCertificate(null);

    try {
      const result = await certificateService.verifyCertificate(certCode);
      setCertificate(result);
      setHasSearched(true);
    } catch (error) {
      console.error("Gagal memverifikasi sertifikat:", error);
      setCertificate(null);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  // Ketika tombol verifikasi ditekan
  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    performVerification(code);
  };

  // Mengisi kode contoh tanpa langsung melakukan verifikasi
  const handleQuickFill = (sampleCode: string) => {
    setCode(sampleCode);
    setCertificate(null);
    setHasSearched(false);
  };

  return (
    <div className="max-w-[1080px] mx-auto py-8 px-4 sm:px-6 pb-24 font-['Montserrat',sans-serif] bg-black text-white">

      {/* Title Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
          Verifikasi Keaslian E-Sertifikat
        </h1>

        <p className="text-[#9C9C9C] max-w-[620px] mx-auto text-sm leading-relaxed">
          Validasi keabsahan dokumen penghargaan, kepanitiaan, atau sertifikat
          peserta kegiatan mahasiswa melalui basis data Convena.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="max-w-[680px] mx-auto mb-12 p-4 sm:p-5 bg-[#1E1E1E] border border-[#3D3D3D] rounded-2xl">

        <form onSubmit={handleVerify} className="space-y-5">

          <label className="block text-xs sm:text-sm font-bold text-white">
            NOMOR SERTIFIKAT / ID
          </label>

          {/* Input */}
          <div className="flex items-center gap-3 bg-black rounded-xl px-4 h-[58px]">
            <Search size={20} className="text-[#9C9C9C] shrink-0" />

            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Masukkan ID Sertifikat"
              className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#777777]"
              required
            />
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full h-[52px] rounded-xl bg-[#CFFE06] text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#b9e500] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 size={17} />
            {loading ? "MEMVALIDASI..." : "VERIFIKASI SEKARANG"}
          </button>

        </form>

        {/* Quick Fill Sample */}
        <div className="mt-4 space-y-2">
          <p className="text-sm text-[#999999]">Contoh Cepat:</p>

          <button
            type="button"
            onClick={() => handleQuickFill("CNV-2026-ITB-8821")}
            className="w-full flex items-center gap-3 px-3 h-[46px] rounded-xl border border-[#3D3D3D] text-white text-xs sm:text-sm hover:border-[#CFFE06] transition-colors"
          >
            <span className="w-3 h-3 rounded-full bg-[#CFFE06] shrink-0" />
            CNV-2026-ITB-8821 (ITB)
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill("CNV-2026-UI-1042")}
            className="w-full flex items-center gap-3 px-3 h-[46px] rounded-xl border border-[#3D3D3D] text-white text-xs sm:text-sm hover:border-[#CFFE06] transition-colors"
          >
            <span className="w-3 h-3 rounded-full bg-white shrink-0" />
            CNV-2026-UI-1042 (UI)
          </button>
        </div>
      </div>

      {/* Result Display */}
      {loading ? (
        <div className="max-w-[680px] mx-auto bg-[#151515] border border-[#262626] rounded-xl overflow-hidden animate-pulse">

          <div className="bg-[#202020] border-b border-[#262626] py-3.5 px-6 flex items-center justify-between">
            <div className="h-4 w-40 bg-[#2c2c2c] rounded" />
            <div className="h-4 w-32 bg-[#262626] rounded" />
          </div>

          <div className="py-12 px-6 sm:px-12 text-center bg-[#121212] space-y-5 flex flex-col items-center">
            <div className="h-3.5 w-64 max-w-full bg-[#242424] rounded" />
            <div className="h-8 w-80 max-w-full bg-[#262626] rounded-lg" />
            <div className="h-3.5 w-44 bg-[#202020] rounded" />
            <div className="h-14 w-72 max-w-full bg-[#202020] border border-[#2e2e2e] rounded-xl" />
            <div className="h-4 w-72 max-w-full bg-[#202020] rounded" />

            <div className="w-full flex items-center justify-around flex-wrap gap-8 border-t border-[#262626] pt-8 mt-4">
              <div className="space-y-2 w-40">
                <div className="h-4 w-28 bg-[#242424] rounded mx-auto" />
                <div className="h-4 w-36 bg-[#262626] rounded mx-auto" />
              </div>
              <div className="w-16 h-16 bg-[#202020] rounded-xl" />
            </div>
          </div>
        </div>
      ) : (
        hasSearched && (
          <div className="max-w-[680px] mx-auto">

            {certificate ? (
              /* Certificate Found */
              <div className="bg-[#151515] border border-[#3D3D3D]/60 rounded-xl overflow-hidden shadow-2xl relative">

                {/* Certificate Header */}
                <div className="bg-[#202020] border-b border-[#3D3D3D]/60 py-3.5 px-6 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-[#CFFE06]" />
                    <span className="font-bold text-xs uppercase tracking-wider text-[#CFFE06]">
                      SERTIFIKAT RESMI TERVERIFIKASI
                    </span>
                  </div>

                  <div className="font-mono text-xs text-[#9C9C9C]">
                    ID: {certificate.certificateNumber}
                  </div>
                </div>

                {/* Certificate Content */}
                <div className="py-12 px-6 sm:px-12 text-center relative bg-[#121212]">

                  <div className="text-xs font-semibold text-[#9C9C9C] uppercase tracking-widest mb-3">
                    {certificate.organizationName} • {certificate.company}
                  </div>

                  <div className="font-extrabold text-2xl sm:text-3xl text-white mb-4 tracking-tight">
                    SERTIFIKAT PENGHARGAAN
                  </div>

                  <p className="text-xs sm:text-sm text-[#9C9C9C] mb-4">
                    Diberikan dengan bangga kepada:
                  </p>

                  {/* Recipient Name */}
                  <div className="inline-block py-3 px-8 bg-[#202020] border border-[#CFFE06] rounded-xl font-bold text-xl sm:text-2xl text-[#CFFE06] mb-4 shadow-[0_0_20px_rgba(207,254,6,0.15)]">
                    {certificate.recipientName}
                  </div>

                  {certificate.studentId && (
                    <div className="text-xs font-mono text-[#9C9C9C] mb-5">
                      NIM: {certificate.studentId}
                    </div>
                  )}

                  <p className="text-xs sm:text-sm max-w-[580px] mx-auto mb-10 leading-relaxed text-[#9C9C9C]">
                    Atas partisipasi dan kontribusi aktifnya sebagai{" "}
                    <strong className="text-white">
                      {certificate.role.toUpperCase()}
                    </strong>{" "}
                    dalam kegiatan{" "}
                    <strong className="text-white">
                      {certificate.eventTitle}
                    </strong>{" "}
                    yang diselenggarakan pada tanggal {certificate.issueDate}.
                  </p>

                  {/* Signatories and QR Code */}
                  <div className="flex items-center justify-around flex-wrap gap-8 border-t border-[#3D3D3D]/50 pt-8">

                    {certificate.signatories.map((sig, idx) => (
                      <div key={idx} className="text-center min-w-[160px]">
                        <div className="h-8 flex items-center justify-center font-mono text-[11px] text-[#CFFE06] mb-1">
                          ✓ Signed Digitally
                        </div>

                        <div className="font-bold text-xs text-white border-t border-[#3D3D3D] pt-1.5">
                          {sig.name}
                        </div>

                        <div className="text-[11px] text-[#9C9C9C] mt-0.5">
                          {sig.title}
                        </div>
                      </div>
                    ))}

                    <div className="text-center">
                      <div className="p-2 bg-black border border-[#3D3D3D] rounded-xl inline-block shadow-md">
                        <QrCode size={56} className="text-[#CFFE06]" />
                      </div>

                      <div className="text-[10px] font-semibold mt-1 text-[#9C9C9C]">
                        Otentikasi Convena
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            ) : (
              /* Certificate Not Found */
              <div className="py-12 px-6 bg-[#151515] border border-[#3D3D3D]/60 rounded-xl text-center">
                <XCircle size={44} className="text-[#DF00D0] mx-auto mb-3" />

                <h3 className="text-lg font-bold text-white mb-2">
                  Maaf, Sertifikat Tidak Ditemukan
                </h3>

                <p className="text-xs text-[#9C9C9C] mb-6 leading-relaxed">
                  Kode <strong className="text-white">"{code}"</strong> tidak
                  terdaftar dalam catatan sertifikat resmi ormawa Convena.
                  Mohon periksa kembali ejaan kode Anda.
                </p>

                <button
                  type="button"
                  onClick={() => handleQuickFill("CNV-2026-ITB-8821")}
                  className="px-5 py-3 rounded-xl bg-[#CFFE06] text-black font-bold text-xs hover:bg-[#b9e500] transition-colors"
                >
                  Coba Contoh Valid (ITB)
                </button>
              </div>
            )}

          </div>
        )
      )}

      {/* Promotion Card */}
      <div className="max-w-[1080px] mx-auto mt-12 p-6 bg-[#1E1E1E] border border-[#CFFE06] rounded-3xl">

        <h3 className="text-sm font-extrabold text-[#CFFE06] mb-2">
          SIAP MENGANGKAT ORMAWA ANDA?
        </h3>

        <p className="text-xs sm:text-sm text-white leading-relaxed mb-5">
          Bergabung bersama ratusan BEM dan Himpunan yang mengotomatisasi
          ticketing dan LPJ tanpa pusing.
        </p>

        <div className="flex items-center gap-2 text-sm font-bold text-[#CFFE06]">
          Jelajahi Demo Convena
          <ArrowRight size={18} />
        </div>

      </div>

    </div>
  );
};
