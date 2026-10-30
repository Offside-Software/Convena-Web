import React from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from '../components/layout/Navbar.tsx'
import { Footer } from '../components/layout/Footer.tsx'

export const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#000000] text-white font-['Montserrat',sans-serif]">
      <Navbar />
      <main className="grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
