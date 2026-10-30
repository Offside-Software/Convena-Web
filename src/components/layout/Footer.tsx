import React from 'react'
import { Link } from 'react-router-dom'
import { BrandLogo } from '../common/BrandLogo.tsx'
import { Badge } from '../common/Badge.tsx'

export const Footer: React.FC = () => {
  const currentYear = 2026

  return (
    <footer className="bg-[#000000] border-t border-[#202020] mt-auto">
      <div className="max-w-[1280px] mx-auto py-12 px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand info */}
          <div className="space-y-4">
            <BrandLogo />
            <p className="text-xs text-[#9C9C9C] leading-relaxed">
              Integrated event & student organization management platform: ticketing, sponsorship CRM, budgeting, and verified digital certificates.
            </p>
            <div className="flex gap-1.5 flex-wrap">
              <Badge variant="dark">TEL-U</Badge>
              <Badge variant="dark">ITB</Badge>
              <Badge variant="dark">UI</Badge>
              <Badge variant="dark">UGM</Badge>
            </div>
          </div>

          {/* Public Features */}
          <div>
            <h4 className="font-['Montserrat',sans-serif] font-bold text-xs uppercase tracking-wider text-white mb-4">
              Explore
            </h4>
            <ul className="list-none p-0 m-0 space-y-2.5">
              <li>
                <Link to="/events" className="text-xs text-[#9C9C9C] hover:text-[#CFFE06] transition-colors">
                  Explore Events
                </Link>
              </li>
              <li>
                <Link to="/verify" className="text-xs text-[#9C9C9C] hover:text-[#CFFE06] transition-colors">
                  Verify Certificate
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-xs text-[#9C9C9C] hover:text-[#CFFE06] transition-colors">
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Workspace Features */}
          <div>
            <h4 className="font-['Montserrat',sans-serif] font-bold text-xs uppercase tracking-wider text-white mb-4">
              Workspace
            </h4>
            <ul className="list-none p-0 m-0 space-y-2.5">
              <li>
                <Link to="/dashboard" className="text-xs text-[#9C9C9C] hover:text-[#CFFE06] transition-colors">
                  Dashboard Overview
                </Link>
              </li>
              <li>
                <Link to="/dashboard/sponsorship" className="text-xs text-[#9C9C9C] hover:text-[#CFFE06] transition-colors">
                  Sponsorship Pipeline CRM
                </Link>
              </li>
              <li>
                <Link to="/dashboard/finances" className="text-xs text-[#9C9C9C] hover:text-[#CFFE06] transition-colors">
                  Anggaran & SPJ Kuitansi
                </Link>
              </li>
            </ul>
          </div>

          {/* Information & Security */}
          <div>
            <h4 className="font-['Montserrat',sans-serif] font-bold text-xs uppercase tracking-wider text-white mb-4">
              Security & Compliance
            </h4>
            <ul className="list-none p-0 m-0 space-y-2.5 text-xs text-[#9C9C9C]">
              <li>QRIS & Payment Gateway Ready</li>
              <li>Encrypted Digital Credentials</li>
              <li>Audited Student Org Workflows</li>
              <li className="text-[#CFFE06] font-medium pt-1">Telkom University & National Campus Network</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#202020] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#9C9C9C] gap-3">
          <div>
            © {currentYear} Convena. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
