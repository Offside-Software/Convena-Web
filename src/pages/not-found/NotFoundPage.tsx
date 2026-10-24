import React from 'react'
import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '../../components/common/Button.tsx'
import { MemphisShape } from '../../components/shapes/MemphisShape.tsx'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-6 text-center relative overflow-hidden bg-[#FAF9F6] bg-[radial-gradient(#FFE600_1.5px,transparent_1.5px)] [background-size:24px_24px]">
      <div className="absolute top-[10%] left-[15%] pointer-events-none hidden md:block">
        <MemphisShape type="zigzag" size={60} color="#FF4B91" animate="slow" />
      </div>
      <div className="absolute bottom-[15%] right-[15%] pointer-events-none hidden md:block">
        <MemphisShape type="triangle" size={50} color="#FFE600" animate="fast" />
      </div>

      <div className="w-full max-w-[540px] py-14 px-8 sm:px-10 bg-white border-2 border-[#121215] rounded-2xl shadow-[10px_10px_0px_0px_#121215] relative z-10">
        <div className="font-['Space_Grotesk',sans-serif] font-black text-7xl sm:text-8xl leading-none text-[#FF4B91] drop-shadow-[4px_4px_0px_#121215] mb-4">
          404
        </div>

        <h2 className="text-2xl sm:text-3xl font-['Space_Grotesk',sans-serif] font-black text-[#121215] mb-3">
          Halaman Tidak Ditemukan!
        </h2>
        <p className="text-sm sm:text-base text-gray-500 mb-8 leading-relaxed">
          Ups! Sepertinya panitia lupa memasang petunjuk arah untuk halaman ini. Mari kembali ke beranda Convena.
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/" className="no-underline">
            <Button variant="yellow" size="md" icon={<Home size={18} />}>
              Kembali ke Beranda
            </Button>
          </Link>
          <Link to="/events" className="no-underline">
            <Button variant="outline" size="md" icon={<ArrowLeft size={18} />}>
              Lihat Event
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
