import React from 'react'
import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '../../components/common/Button.tsx'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-6 text-center relative overflow-hidden bg-[#000000] text-white font-['Montserrat',sans-serif]">
      <div className="w-full max-w-[500px] py-12 px-8 bg-[#151515] border border-[#3D3D3D]/60 rounded-2xl relative z-10 shadow-2xl">
        <div className="font-extrabold text-7xl sm:text-8xl leading-none text-[#CFFE06] mb-3 tracking-tight">
          404
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-xs sm:text-sm text-[#9C9C9C] mb-8 leading-relaxed">
          Tautan yang Anda tuju mungkin salah ketik atau telah dipindahkan.
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/" className="no-underline">
            <Button variant="accent" size="md" icon={<Home size={16} />}>
              Kembali ke Beranda
            </Button>
          </Link>
          <Link to="/events" className="no-underline">
            <Button variant="outline" size="md" icon={<ArrowLeft size={16} />}>
              Lihat Event
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
