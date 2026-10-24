import React from 'react'
import { Link } from 'react-router-dom'
import { MemphisShape } from '../shapes/MemphisShape.tsx'
import { Badge } from '../common/Badge.tsx'

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t-4 border-[#121215] mt-auto relative overflow-hidden">
      {/* Decorative Memphis top colored stripes */}
      <div className="grid grid-cols-5 h-2.5 border-b-2 border-[#121215]">
        <div className="bg-[#FFE600]" />
        <div className="bg-[#FF4B91]" />
        <div className="bg-[#01CDFE]" />
        <div className="bg-[#845EC2]" />
        <div className="bg-[#00F5D4]" />
      </div>

      <div className="max-w-[1280px] mx-auto py-12 px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Brand info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#FF4B91] border-2 border-[#121215] rounded-md flex items-center justify-center font-black text-white text-base">
                C
              </div>
              <span className="font-['Space_Grotesk',sans-serif] font-black text-2xl text-[#121215]">
                CONVENA
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Operating system terintegrasi untuk organisasi mahasiswa Indonesia: manajemen acara, proposal, LPJ/SPJ, sponsorship CRM, dan sertifikat digital tervalidasi.
            </p>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="pink">TEL-U</Badge>
              <Badge variant="yellow">ITB</Badge>
              <Badge variant="cyan">UI</Badge>
              <Badge variant="pink">UGM</Badge>
              <Badge variant="mint">ITS</Badge>
              <Badge variant="purple">UNAIR</Badge>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-['Space_Grotesk',sans-serif] font-black text-base uppercase mb-4 flex items-center gap-1.5 text-[#121215]">
              <MemphisShape type="triangle" size={14} color="#FFE600" />
              <span>Fitur Utama</span>
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
              <li>
                <Link to="/events" className="text-sm text-[#121215] font-semibold hover:text-[#FF4B91] transition-colors">
                  Katalog Event Kampus
                </Link>
              </li>
              <li>
                <Link to="/dashboard/sponsorship" className="text-sm text-[#121215] font-semibold hover:text-[#FF4B91] transition-colors">
                  Sponsorship Pipeline CRM
                </Link>
              </li>
              <li>
                <Link to="/dashboard/finances" className="text-sm text-[#121215] font-semibold hover:text-[#FF4B91] transition-colors">
                  Manajemen Anggaran & SPJ
                </Link>
              </li>
              <li>
                <Link to="/verify" className="text-sm text-[#121215] font-semibold hover:text-[#FF4B91] transition-colors">
                  Verifikasi E-Certificate
                </Link>
              </li>
            </ul>
          </div>

          {/* Guidelines & LPJ */}
          <div>
            <h4 className="font-['Space_Grotesk',sans-serif] font-black text-base uppercase mb-4 flex items-center gap-1.5 text-[#121215]">
              <MemphisShape type="cross" size={14} color="#01CDFE" />
              <span>Operasional Ormawa</span>
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
              <li>
                <a href="#lpj" className="text-sm text-[#121215] font-semibold hover:text-[#01CDFE] transition-colors">
                  Format Template LPJ Resmi
                </a>
              </li>
              <li>
                <a href="#spj" className="text-sm text-[#121215] font-semibold hover:text-[#01CDFE] transition-colors">
                  Standar Audit Kuitansi & SPJ
                </a>
              </li>
              <li>
                <a href="#payment" className="text-sm text-[#121215] font-semibold hover:text-[#01CDFE] transition-colors">
                  Integrasi QRIS & Virtual Account
                </a>
              </li>
              <li>
                <a href="#security" className="text-sm text-[#121215] font-semibold hover:text-[#01CDFE] transition-colors">
                  Keamanan & Hak Akses Panitia
                </a>
              </li>
            </ul>
          </div>

          {/* Memphis Decorative Badge Box */}
          <div className="p-5 bg-[#FFF585] border-2 border-[#121215] rounded-xl shadow-[4px_4px_0px_0px_#121215] flex flex-col justify-center relative">
            <div className="absolute -top-2.5 right-2.5">
              <MemphisShape type="starburst" size={28} color="#FF4B91" animate="slow" />
            </div>
            <h5 className="font-['Space_Grotesk',sans-serif] font-black text-sm mb-1 text-[#121215]">
              Siap Mengangkat Ormawa Anda?
            </h5>
            <p className="text-xs text-gray-700 mb-3 leading-relaxed">
              Bergabung bersama ratusan BEM dan Himpunan yang mengotomatisasi ticketing dan LPJ tanpa pusing.
            </p>
            <Link to="/events" className="no-underline">
              <span className="font-['Space_Grotesk',sans-serif] font-black text-xs underline text-[#121215] hover:text-[#FF4B91] transition-colors">
                Jelajahi Demo Convena →
              </span>
            </Link>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t-2 border-dashed border-[#121215] pt-6 flex items-center justify-between flex-wrap gap-4 text-xs font-semibold text-gray-500">
          <div>
            © 2026 Convena.
          </div>
          <div className="flex gap-4 font-mono">
            <span>v1.0.0-rc</span>
            <span>Axum</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
