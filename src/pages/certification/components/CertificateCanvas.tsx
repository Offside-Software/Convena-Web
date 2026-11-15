import React from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Award, CheckCircle2, ShieldCheck, Users } from 'lucide-react'
import type {
  CertificateCategory,
  CertificateTemplateDesign,
} from '../../../types/certificate.ts'
import {
  buildCertificateVerifyUrl,
  buildSignatoryQrPayload,
} from '../../../services/certificate.service.ts'

export interface CertificateCanvasProps {
  template: CertificateTemplateDesign
  certificateNumber: string
  eventId: string
  eventTitle: string
  organizationName: string
  company: string
  issueDate: string
  recipientName: string
  studentId?: string
  institution?: string
  category?: CertificateCategory
  roleLabel?: string
  rank?: string
  groupName?: string
  groupMembers?: string[]
  verified?: boolean
  id?: string
  className?: string
}

function interpolateCertificateDescription(
  rawTemplate: string,
  vars: {
    nama: string
    event: string
    peran: string
    peringkat: string
    tim: string
    anggota: string
    instansi: string
    tanggal: string
    nomor: string
  }
): string {
  return rawTemplate
    .replace(/\{\{\s*nama\s*\}\}/gi, vars.nama)
    .replace(/\{\{\s*recipient\s*\}\}/gi, vars.nama)
    .replace(/\{\{\s*event\s*\}\}/gi, vars.event)
    .replace(/\{\{\s*peran\s*\}\}/gi, vars.peran)
    .replace(/\{\{\s*role\s*\}\}/gi, vars.peran)
    .replace(/\{\{\s*peringkat\s*\}\}/gi, vars.peringkat)
    .replace(/\{\{\s*rank\s*\}\}/gi, vars.peringkat)
    .replace(/\{\{\s*tim\s*\}\}/gi, vars.tim)
    .replace(/\{\{\s*group\s*\}\}/gi, vars.tim)
    .replace(/\{\{\s*anggota\s*\}\}/gi, vars.anggota)
    .replace(/\{\{\s*instansi\s*\}\}/gi, vars.instansi)
    .replace(/\{\{\s*tanggal\s*\}\}/gi, vars.tanggal)
    .replace(/\{\{\s*date\s*\}\}/gi, vars.tanggal)
    .replace(/\{\{\s*nomor\s*\}\}/gi, vars.nomor)
    .replace(/\s+/g, ' ')
    .trim()
}

export const CertificateCanvas: React.FC<CertificateCanvasProps> = ({
  template,
  certificateNumber,
  eventId,
  eventTitle,
  organizationName,
  company,
  issueDate,
  recipientName,
  studentId,
  institution,
  category = 'attendance',
  roleLabel,
  rank,
  groupName,
  groupMembers = [],
  verified = true,
  id = 'convena-certificate-canvas',
  className = '',
}) => {
  const {
    colors,
    borderStyle,
    borderWidth,
    orientation,
    logoUrl,
    embedLogoInQr,
    badgeText,
    title,
    subtitle,
    description,
    showStudentId,
    showGroupMembers,
    signatories,
  } = template

  const defaultRoleMap: Record<CertificateCategory, string> = {
    winner: 'Pemenang Kompetisi',
    attendance: 'Peserta Kegiatan',
    group: 'Delegasi Tim',
    speaker: 'Narasumber Kehormatan',
    committee: 'Panitia Pelaksana',
    custom: 'Partisipan Kehormatan',
  }

  const effectiveRole = roleLabel?.trim() || defaultRoleMap[category] || 'Peserta'
  const effectiveDisplayName =
    category === 'group' && groupName?.trim()
      ? groupName.trim()
      : recipientName || 'Nama Penerima Sertifikat'

  const formattedDescription = interpolateCertificateDescription(description, {
    nama: effectiveDisplayName,
    event: eventTitle || 'Kegiatan Mahasiswa Convena',
    peran: effectiveRole,
    peringkat: rank?.trim() || (category === 'winner' ? 'Juara Terbaik' : effectiveRole),
    tim: groupName?.trim() || effectiveDisplayName,
    anggota:
      groupMembers.length > 0 ? groupMembers.join(', ') : effectiveDisplayName,
    instansi: institution?.trim() || company || 'Institusi Akademik',
    tanggal: issueDate || '15 November 2026',
    nomor: certificateNumber,
  })

  const mainQrUrl = buildCertificateVerifyUrl(certificateNumber)

  // Border style mapping
  const radiusClass =
    borderStyle === 'rounded'
      ? 'rounded-[28px]'
      : borderStyle === 'ornate'
        ? 'rounded-2xl'
        : borderStyle === 'double'
          ? 'rounded-xl'
          : 'rounded-none'

  const outerBorderStyle: React.CSSProperties = {
    backgroundColor: colors.background,
    color: colors.text,
    borderColor: borderStyle === 'none' ? 'transparent' : colors.primary,
    borderWidth:
      borderStyle === 'none'
        ? 0
        : borderStyle === 'minimal'
          ? 0
          : borderStyle === 'double'
            ? Math.max(4, borderWidth * 2)
            : borderWidth,
    borderStyle:
      borderStyle === 'double'
        ? 'double'
        : borderStyle === 'none' || borderStyle === 'minimal'
          ? 'none'
          : 'solid',
    boxShadow: `0 20px 60px rgba(0,0,0,0.45), inset 0 0 0 1px ${colors.primary}22`,
  }

  return (
    <div
      id={id}
      style={outerBorderStyle}
      className={`relative overflow-hidden font-['Montserrat',sans-serif] transition-all duration-300 select-none ${radiusClass} ${
        orientation === 'portrait'
          ? 'max-w-[640px] mx-auto min-h-[820px] py-10 px-7 sm:px-10 flex flex-col justify-between'
          : 'w-full min-h-[540px] py-8 px-6 sm:px-12 flex flex-col justify-between'
      } ${className}`}
    >
      {/* Minimal Border Top & Bottom Bars */}
      {borderStyle === 'minimal' && (
        <>
          <div
            style={{
              background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`,
              height: `${Math.max(6, borderWidth * 3)}px`,
            }}
            className="absolute top-0 left-0 right-0"
          />
          <div
            style={{
              background: `linear-gradient(90deg, ${colors.accent}, ${colors.primary})`,
              height: `${Math.max(6, borderWidth * 3)}px`,
            }}
            className="absolute bottom-0 left-0 right-0"
          />
        </>
      )}

      {/* Ornate Corner Accents & Inner Frame */}
      {borderStyle === 'ornate' && (
        <>
          <div
            style={{ borderColor: `${colors.primary}55` }}
            className="pointer-events-none absolute inset-3 border rounded-xl"
          />
          <div
            style={{ borderColor: colors.accent }}
            className="pointer-events-none absolute top-5 left-5 w-8 h-8 border-t-4 border-l-4 rounded-tl-md"
          />
          <div
            style={{ borderColor: colors.accent }}
            className="pointer-events-none absolute top-5 right-5 w-8 h-8 border-t-4 border-r-4 rounded-tr-md"
          />
          <div
            style={{ borderColor: colors.accent }}
            className="pointer-events-none absolute bottom-5 left-5 w-8 h-8 border-b-4 border-l-4 rounded-bl-md"
          />
          <div
            style={{ borderColor: colors.accent }}
            className="pointer-events-none absolute bottom-5 right-5 w-8 h-8 border-b-4 border-r-4 rounded-br-md"
          />
        </>
      )}

      {/* Double Inner Line */}
      {borderStyle === 'double' && (
        <div
          style={{ borderColor: `${colors.accent}66` }}
          className="pointer-events-none absolute inset-3 border rounded-lg"
        />
      )}

      {/* Subtle Ambient Glow */}
      <div
        style={{
          background: `radial-gradient(circle at 50% 0%, ${colors.primary}18 0%, transparent 65%)`,
        }}
        className="pointer-events-none absolute inset-0"
      />

      {/* TOP HEADER BAR */}
      <div className="relative z-10 flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-current/10">
        <div className="flex items-center gap-3">
          {logoUrl && (
            <div
              style={{
                backgroundColor: colors.surface,
                borderColor: `${colors.primary}66`,
              }}
              className="w-12 h-12 rounded-xl border p-1.5 flex items-center justify-center shrink-0 shadow-md overflow-hidden"
            >
              <img
                src={logoUrl}
                alt="Logo Institusi"
                className="w-full h-full object-contain"
              />
            </div>
          )}
          <div className="text-left">
            <div
              style={{ color: colors.primary }}
              className="text-[11px] font-extrabold uppercase tracking-widest flex items-center gap-1.5"
            >
              {verified && <CheckCircle2 size={13} />}
              <span>{badgeText || 'SERTIFIKAT RESMI TERVERIFIKASI'}</span>
            </div>
            <div
              style={{ color: colors.mutedText }}
              className="text-xs font-semibold tracking-wide mt-0.5"
            >
              {organizationName} • {company}
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: colors.surface,
            borderColor: `${colors.primary}40`,
            color: colors.mutedText,
          }}
          className="px-3 py-1.5 rounded-lg border font-mono text-[11px] font-semibold tracking-wider"
        >
          No: <span style={{ color: colors.text }}>{certificateNumber}</span>
        </div>
      </div>

      {/* CENTER BODY */}
      <div className="relative z-10 my-auto py-6 text-center flex flex-col items-center">
        {/* Main Certificate Title */}
        <h2
          style={{ color: colors.text }}
          className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight mb-2"
        >
          {title || 'SERTIFIKAT PENGHARGAAN'}
        </h2>

        {/* Decorative Divider */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span
            style={{ backgroundColor: colors.primary }}
            className="h-0.5 w-12 rounded-full"
          />
          <span
            style={{ backgroundColor: colors.accent }}
            className="h-2 w-2 rounded-full rotate-45"
          />
          <span
            style={{ backgroundColor: colors.primary }}
            className="h-0.5 w-12 rounded-full"
          />
        </div>

        {/* Subtitle */}
        <p
          style={{ color: colors.mutedText }}
          className="text-xs sm:text-sm font-medium mb-3"
        >
          {subtitle || 'Diberikan dengan bangga kepada:'}
        </p>

        {/* Recipient Name Box */}
        <div
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.primary,
            color: colors.primary,
            boxShadow: `0 0 28px ${colors.primary}22`,
          }}
          className={`inline-flex flex-col items-center justify-center py-3 px-8 sm:px-10 border-2 mb-3 max-w-full ${
            borderStyle === 'flat' ? 'rounded-none' : 'rounded-2xl'
          }`}
        >
          <span className="font-extrabold text-xl sm:text-2xl md:text-3xl tracking-tight break-words text-center">
            {effectiveDisplayName}
          </span>
          {category === 'group' &&
            recipientName &&
            groupName &&
            recipientName !== groupName && (
              <span
                style={{ color: colors.text }}
                className="text-xs font-semibold mt-1 opacity-90"
              >
                Perwakilan / Ketua Tim: {recipientName}
              </span>
            )}
        </div>

        {/* Rank / Winner Achievement Pill */}
        {rank && (
          <div
            style={{
              backgroundColor: `${colors.accent}20`,
              borderColor: colors.accent,
              color: colors.accent,
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border text-xs font-extrabold uppercase tracking-wider mb-2.5"
          >
            <Award size={14} />
            <span>{rank}</span>
          </div>
        )}

        {/* Student ID / NIM or Institution */}
        {showStudentId && (studentId || institution) && (
          <div
            style={{ color: colors.mutedText }}
            className="text-xs font-mono mb-3 flex items-center justify-center gap-2 flex-wrap"
          >
            {studentId && <span>NIM / ID: {studentId}</span>}
            {studentId && institution && <span>•</span>}
            {institution && <span>{institution}</span>}
          </div>
        )}

        {/* Group Members List (When Group Certificate) */}
        {showGroupMembers && groupMembers.length > 0 && (
          <div
            style={{
              backgroundColor: `${colors.surface}CC`,
              borderColor: `${colors.primary}33`,
            }}
            className="max-w-[620px] w-full mx-auto mb-4 px-4 py-2.5 rounded-xl border"
          >
            <div
              style={{ color: colors.primary }}
              className="text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center justify-center gap-1.5"
            >
              <Users size={12} />
              <span>Anggota Tim / Kelompok ({groupMembers.length} Orang)</span>
            </div>
            <div className="flex items-center justify-center flex-wrap gap-1.5">
              {groupMembers.map((member, i) => (
                <span
                  key={i}
                  style={{
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: `${colors.primary}30`,
                  }}
                  className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border"
                >
                  {member}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description Paragraph */}
        <p
          style={{ color: colors.mutedText }}
          className="text-xs sm:text-sm max-w-[660px] mx-auto leading-relaxed font-medium"
        >
          {formattedDescription}
        </p>
      </div>

      {/* BOTTOM SIGNATORIES (ALL SIGNATURES ARE QR WITHOUT IMAGES) + MAIN CERTIFICATE QR */}
      <div className="relative z-10 pt-5 border-t border-current/15 flex items-end justify-between flex-wrap gap-6">
        {/* Dynamic Signatories Row — Strictly QR-only signatures (no image inside signatory QRs) */}
        <div className="flex-1 flex items-end justify-around flex-wrap gap-6">
          {signatories.map((sig, idx) => {
            const sigQrPayload = buildSignatoryQrPayload({
              certificateNumber,
              eventId,
              signerName: sig.name,
              signerTitle: sig.title,
              signerIdNumber: sig.idNumber,
              index: idx,
            })

            return (
              <div
                key={sig.id || idx}
                className="flex flex-col items-center text-center min-w-[145px] max-w-[200px]"
              >
                <div
                  style={{ color: colors.mutedText }}
                  className="text-[9px] font-bold uppercase tracking-widest mb-1.5"
                >
                  Tanda Tangan Sah (QR)
                </div>

                {/* Signatory QR Code — NEVER displays an image inside it */}
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: colors.primary,
                  }}
                  className="p-2 rounded-xl border-2 shadow-md mb-2 flex items-center justify-center"
                  title={`Tanda Tangan QR: ${sig.name} (${sig.title})`}
                >
                  <QRCodeSVG
                    value={sigQrPayload}
                    size={68}
                    level="M"
                    bgColor="#FFFFFF"
                    fgColor="#0A0A0A"
                  />
                </div>

                {/* Signatory Name & Role */}
                <div
                  style={{
                    color: colors.text,
                    borderColor: `${colors.primary}66`,
                  }}
                  className="font-bold text-xs border-t pt-1.5 px-2 w-full leading-snug"
                >
                  {sig.name || 'Nama Penandatangan'}
                </div>
                <div
                  style={{ color: colors.primary }}
                  className="text-[11px] font-semibold mt-0.5 leading-tight"
                >
                  {sig.title || 'Jabatan'}
                </div>
                {sig.idNumber && (
                  <div
                    style={{ color: colors.mutedText }}
                    className="text-[10px] font-mono mt-0.5"
                  >
                    {sig.idNumber}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Main Certificate Authenticity QR (Supports Logo embedded inside QR!) */}
        <div
          style={{
            backgroundColor: colors.surface,
            borderColor: `${colors.primary}50`,
          }}
          className="flex flex-col items-center p-2.5 rounded-2xl border shrink-0 mx-auto sm:mx-0"
        >
          <div className="p-2 bg-white rounded-xl shadow-inner flex items-center justify-center">
            <QRCodeSVG
              value={mainQrUrl}
              size={78}
              level="H"
              bgColor="#FFFFFF"
              fgColor="#0A0A0A"
              imageSettings={
                logoUrl && embedLogoInQr
                  ? {
                      src: logoUrl,
                      height: 22,
                      width: 22,
                      excavate: true,
                    }
                  : undefined
              }
            />
          </div>
          <div
            style={{ color: colors.primary }}
            className="text-[10px] font-extrabold uppercase tracking-wider mt-1.5 flex items-center gap-1"
          >
            <ShieldCheck size={12} />
            <span>QR Validasi</span>
          </div>
          <div
            style={{ color: colors.mutedText }}
            className="text-[9px] font-mono"
          >
            {issueDate}
          </div>
        </div>
      </div>
    </div>
  )
}
