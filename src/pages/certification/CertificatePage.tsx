import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Calendar,
  PaintBucket,
  Users,
  Award,
  Printer,
  ShieldCheck,
  RefreshCw,
  Plus,
  Trash2,
  Eye,
  Sparkles,
  CheckCircle2,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { Button } from '../../components/common/Button.tsx'
import { Badge } from '../../components/common/Badge.tsx'
import { Select } from '../../components/common/Select.tsx'
import { Toast, type ToastType } from '../../components/common/Toast.tsx'
import { eventsService } from '../../services/events.service.ts'
import {
  certificateService,
  formatCertificateNumber,
  mapCategoryToRole,
  buildSignatoryQrPayload,
} from '../../services/certificate.service.ts'
import type { Event, EventRegistration } from '../../types/event.ts'
import type {
  Certificate,
  CertificateCategory,
  CertificateRecipientInput,
  CertificateTemplateDesign,
} from '../../types/certificate.ts'
import { CertificateCanvas } from './components/CertificateCanvas.tsx'
import { TemplateEditor } from './components/TemplateEditor.tsx'
import { RecipientsPanel } from './components/RecipientsPanel.tsx'
import {
  CERTIFICATE_CATEGORIES,
  getPresetTemplateByCategory,
} from './components/certificatePresets.ts'
import { printCertificateElement } from './components/certificateExport.ts'

function formatIndonesianDate(isoOrDate?: string): string {
  if (!isoOrDate) return '15 November 2026'
  const parsed = new Date(isoOrDate)
  if (Number.isNaN(parsed.getTime())) return isoOrDate
  return parsed.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export const CertificatePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryEventId = searchParams.get('eventId')

  // Events state (Certificates must be related to specific events)
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>(
    queryEventId || ''
  )
  const [eventsLoading, setEventsLoading] = useState(true)

  // Event-specific registrations & issued certificates
  const [registrations, setRegistrations] = useState<EventRegistration[]>([])
  const [registrationsLoading, setRegistrationsLoading] = useState(false)
  const [issuedCertificates, setIssuedCertificates] = useState<Certificate[]>(
    []
  )
  const [certificatesLoading, setCertificatesLoading] = useState(false)

  // Active workspace tab
  const [activeTab, setActiveTab] = useState<
    'design' | 'recipients' | 'issued'
  >('design')
  const [editorExpanded, setEditorExpanded] = useState(false)

  const handleToggleExpandEditor = () => {
    const next = !editorExpanded
    setEditorExpanded(next)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('convena:toggle-desktop-sidebar', {
          detail: { hidden: next },
        })
      )
    }
  }

  // Active certificate category & per-category template designs so winners/attendees/groups can vary
  const [activeCategory, setActiveCategory] =
    useState<CertificateCategory>('winner')
  const [autoSyncCategoryTemplate, setAutoSyncCategoryTemplate] =
    useState<boolean>(true)
  const [templatesByCategory, setTemplatesByCategory] = useState<
    Record<CertificateCategory, CertificateTemplateDesign>
  >(() => ({
    winner: getPresetTemplateByCategory('winner'),
    attendance: getPresetTemplateByCategory('attendance'),
    group: getPresetTemplateByCategory('group'),
    speaker: getPresetTemplateByCategory('speaker'),
    committee: getPresetTemplateByCategory('committee'),
    custom: getPresetTemplateByCategory('custom'),
  }))

  // Issue date override
  const [issueDate, setIssueDate] = useState<string>('15 November 2026')

  // Recipients queue (initialized with 3 diverse samples so user can immediately experiment)
  const [recipients, setRecipients] = useState<CertificateRecipientInput[]>([
    {
      id: 'sample-winner-1',
      type: 'custom',
      name: 'Alya Putri Maharani',
      email: 'alya.maharani@students.itb.ac.id',
      studentId: '13522018',
      institution: 'Institut Teknologi Bandung',
      category: 'winner',
      roleLabel: 'Finalis Kompetisi Nasional',
      rank: 'Juara 1 (First Place)',
    },
    {
      id: 'sample-group-1',
      type: 'group',
      name: 'Bagas Adi Saputra',
      groupName: 'Tim Nusantara AI Lab',
      groupMembers: [
        'Bagas Adi Saputra',
        'Nadia Larasati',
        'Kevin Wijaya',
        'Zahra Aulia',
      ],
      institution: 'Universitas Indonesia',
      category: 'group',
      roleLabel: 'Delegasi Tim Hackathon',
      rank: 'Juara Terbaik Kategori Tim',
    },
    {
      id: 'sample-attendee-1',
      type: 'participant',
      name: 'Dimas Wahyu Nugroho',
      email: 'dimas.wahyu@ugm.ac.id',
      studentId: '22/492811/TK/54122',
      institution: 'Universitas Gadjah Mada',
      category: 'attendance',
      roleLabel: 'Peserta Kegiatan',
    },
  ])
  const [activeRecipientId, setActiveRecipientId] =
    useState<string>('sample-winner-1')

  // Action loading states
  const [savingTemplate, setSavingTemplate] = useState(false)
  const [issuing, setIssuing] = useState(false)

  // Toast state
  const [toast, setToast] = useState<{
    open: boolean
    type: ToastType
    title: string
    message: string
  }>({
    open: false,
    type: 'info',
    title: '',
    message: '',
  })

  const notify = (type: ToastType, title: string, message: string) => {
    setToast({ open: true, type, title, message })
  }

  // 1. Load user's events (or public events)
  useEffect(() => {
    let isMounted = true

    eventsService
      .getMyEvents()
      .then((myEvts) => {
        if (myEvts.length > 0) return myEvts
        return eventsService.getEvents()
      })
      .then((evts) => {
        if (!isMounted) return
        setEvents(evts)
        if (evts.length > 0) {
          const matching = queryEventId
            ? evts.find((e) => e.id === queryEventId)
            : undefined
          const chosen = matching || evts[0]
          setSelectedEventId(chosen.id)
          setIssueDate(formatIndonesianDate(chosen.endDate || chosen.startDate))
          if (chosen.id !== queryEventId) {
            setSearchParams({ eventId: chosen.id }, { replace: true })
          }
        }
      })
      .catch(() => {
        if (!isMounted) return
        setToast({
          open: true,
          type: 'error',
          title: 'Gagal Memuat Event',
          message: 'Tidak dapat memuat daftar event dari server API.',
        })
      })
      .finally(() => {
        if (isMounted) setEventsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [queryEventId, setSearchParams])

  // 2. Load event-specific registrations, templates, and issued certificates
  const loadEventCertificationData = useCallback(async (eventId: string) => {
    if (!eventId) return
    setRegistrationsLoading(true)
    setCertificatesLoading(true)

    try {
      const regs = await eventsService.getEventRegistrations(eventId)
      setRegistrations(regs)
    } catch {
      setRegistrations([])
    } finally {
      setRegistrationsLoading(false)
    }

    try {
      const [remoteTemplates, remoteCerts] = await Promise.all([
        certificateService.getEventTemplates(eventId),
        certificateService.getEventCertificates(eventId),
      ])

      if (Array.isArray(remoteTemplates) && remoteTemplates.length > 0) {
        setTemplatesByCategory((prev) => {
          const updated = { ...prev }
          for (const tmpl of remoteTemplates) {
            if (tmpl.category && updated[tmpl.category]) {
              updated[tmpl.category] = tmpl
            }
          }
          return updated
        })
      }

      setIssuedCertificates(Array.isArray(remoteCerts) ? remoteCerts : [])
    } catch {
      setIssuedCertificates([])
    } finally {
      setCertificatesLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!selectedEventId) return
    let isMounted = true

    eventsService
      .getEventRegistrations(selectedEventId)
      .then((regs) => {
        if (isMounted) setRegistrations(regs)
      })
      .catch(() => {
        if (isMounted) setRegistrations([])
      })

    Promise.all([
      certificateService.getEventTemplates(selectedEventId),
      certificateService.getEventCertificates(selectedEventId),
    ])
      .then(([remoteTemplates, remoteCerts]) => {
        if (!isMounted) return
        if (Array.isArray(remoteTemplates) && remoteTemplates.length > 0) {
          setTemplatesByCategory((prev) => {
            const updated = { ...prev }
            for (const tmpl of remoteTemplates) {
              if (tmpl.category && updated[tmpl.category]) {
                updated[tmpl.category] = tmpl
              }
            }
            return updated
          })
        }
        setIssuedCertificates(Array.isArray(remoteCerts) ? remoteCerts : [])
      })
      .catch(() => {
        if (isMounted) setIssuedCertificates([])
      })

    return () => {
      isMounted = false
    }
  }, [selectedEventId])

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId),
    [events, selectedEventId]
  )

  const handleSelectEvent = (newEventId: string) => {
    if (!newEventId || newEventId === selectedEventId) return
    setSelectedEventId(newEventId)
    setSearchParams({ eventId: newEventId })
    const found = events.find((e) => e.id === newEventId)
    if (found) {
      setIssueDate(formatIndonesianDate(found.endDate || found.startDate))
    }
  }

  const activeRecipient = useMemo(() => {
    return (
      recipients.find((r) => r.id === activeRecipientId) ||
      recipients[0] || {
        id: 'preview-default',
        type: 'custom' as const,
        name: 'Nama Penerima Sertifikat',
        category: activeCategory,
        roleLabel: 'Peserta Kegiatan',
      }
    )
  }, [recipients, activeRecipientId, activeCategory])

  // Active template design (either synced to recipient's category or currently selected category)
  const effectiveCategory: CertificateCategory = autoSyncCategoryTemplate
    ? activeRecipient.category || activeCategory
    : activeCategory

  const currentTemplate = templatesByCategory[effectiveCategory]

  const handleTemplateChange = (updated: CertificateTemplateDesign) => {
    setTemplatesByCategory((prev) => ({
      ...prev,
      [effectiveCategory]: updated,
    }))
  }

  const handleCategoryChange = (
    cat: CertificateCategory,
    applyPreset: boolean
  ) => {
    setActiveCategory(cat)
    if (applyPreset) {
      setTemplatesByCategory((prev) => ({
        ...prev,
        [cat]: getPresetTemplateByCategory(cat),
      }))
    }
    // Also switch activeRecipient's category if user is experimenting on the active recipient
    if (activeRecipient && recipients.some((r) => r.id === activeRecipient.id)) {
      setRecipients((prev) =>
        prev.map((r) =>
          r.id === activeRecipient.id ? { ...r, category: cat } : r
        )
      )
    }
  }

  const handleSelectRecipient = (id: string) => {
    setActiveRecipientId(id)
    const target = recipients.find((r) => r.id === id)
    if (target && autoSyncCategoryTemplate) {
      setActiveCategory(target.category)
    }
  }

  const handleAddRecipients = (newItems: CertificateRecipientInput[]) => {
    if (newItems.length === 0) return
    setRecipients((prev) => [...prev, ...newItems])
    setActiveRecipientId(newItems[0].id)
    if (autoSyncCategoryTemplate) {
      setActiveCategory(newItems[0].category)
    }
    notify(
      'success',
      'Penerima Ditambahkan',
      `${newItems.length} penerima sertifikat berhasil ditambahkan ke antrean.`
    )
  }

  const handleUpdateRecipient = (
    id: string,
    patch: Partial<CertificateRecipientInput>
  ) => {
    setRecipients((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
    )
    if (id === activeRecipientId && patch.category && autoSyncCategoryTemplate) {
      setActiveCategory(patch.category)
    }
  }

  const handleRemoveRecipient = (id: string) => {
    setRecipients((prev) => {
      const remaining = prev.filter((r) => r.id !== id)
      if (id === activeRecipientId && remaining.length > 0) {
        setActiveRecipientId(remaining[0].id)
      }
      return remaining
    })
  }

  const handleSaveTemplateToApi = async () => {
    if (!selectedEvent) return
    setSavingTemplate(true)
    try {
      const catMeta = CERTIFICATE_CATEGORIES.find(
        (c) => c.value === effectiveCategory
      )
      await certificateService.saveEventTemplate(selectedEvent.id, {
        name: `Template ${catMeta?.shortLabel || effectiveCategory} - ${selectedEvent.title}`,
        category: effectiveCategory,
        ...currentTemplate,
      })
      notify(
        'success',
        'Template Disimpan',
        `Desain template kategori ${catMeta?.shortLabel || effectiveCategory} berhasil disimpan untuk event "${selectedEvent.title}".`
      )
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'message' in err &&
        typeof (err as { message?: string }).message === 'string'
          ? (err as { message: string }).message
          : 'Gagal menyimpan template sertifikat ke server API.'
      notify('error', 'Gagal Menyimpan Template', msg)
    } finally {
      setSavingTemplate(false)
    }
  }

  const handleIssueCertificates = async () => {
    if (!selectedEvent || recipients.length === 0) return
    setIssuing(true)
    try {
      const created = await certificateService.issueCertificates(
        selectedEvent.id,
        {
          eventId: selectedEvent.id,
          template: currentTemplate,
          category: effectiveCategory,
          issueDate,
          recipients,
        }
      )
      if (Array.isArray(created) && created.length > 0) {
        setIssuedCertificates((prev) => [...created, ...prev])
      } else {
        // Construct issued certificate objects from API response if server returned minimal acknowledgment
        const generated: Certificate[] = recipients.map((rec, idx) => {
          const certNo = formatCertificateNumber(
            selectedEvent.slug || selectedEvent.title,
            rec.category,
            issuedCertificates.length + idx + 1
          )
          const recTemplate = templatesByCategory[rec.category] || currentTemplate
          return {
            id: `cert-${Date.now()}-${idx}`,
            certificateNumber: certNo,
            recipientName:
              rec.type === 'group' && rec.groupName ? rec.groupName : rec.name,
            recipientEmail: rec.email || '',
            studentId: rec.studentId,
            company: rec.institution || selectedEvent.company || 'Convena',
            eventId: selectedEvent.id,
            eventTitle: selectedEvent.title,
            organizationName:
              selectedEvent.organizationName || 'Panitia Pelaksana',
            issueDate,
            role: mapCategoryToRole(rec.category),
            verified: true,
            category: rec.category,
            recipientType: rec.type,
            groupName: rec.groupName,
            groupMembers: rec.groupMembers,
            rank: rec.rank,
            roleLabel: rec.roleLabel,
            templateSnapshot: recTemplate,
            signatories: recTemplate.signatories.map((sig, sIdx) => ({
              name: sig.name,
              title: sig.title,
              idNumber: sig.idNumber,
              signatureQrValue: buildSignatoryQrPayload({
                certificateNumber: certNo,
                eventId: selectedEvent.id,
                signerName: sig.name,
                signerTitle: sig.title,
                signerIdNumber: sig.idNumber,
                index: sIdx,
              }),
            })),
          }
        })
        setIssuedCertificates((prev) => [...generated, ...prev])
      }
      notify(
        'success',
        'Sertifikat Berhasil Diterbitkan',
        `${recipients.length} sertifikat untuk event "${selectedEvent.title}" telah diterbitkan.`
      )
      setActiveTab('issued')
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'message' in err &&
        typeof (err as { message?: string }).message === 'string'
          ? (err as { message: string }).message
          : 'Gagal menerbitkan sertifikat ke server API.'
      notify('error', 'Penerbitan Gagal', msg)
    } finally {
      setIssuing(false)
    }
  }

  const handleRevokeCertificate = async (certId: string) => {
    if (!selectedEvent) return
    try {
      await certificateService.revokeCertificate(selectedEvent.id, certId)
      setIssuedCertificates((prev) => prev.filter((c) => c.id !== certId))
      notify(
        'info',
        'Sertifikat Dicabut',
        'Sertifikat telah dihapus dari daftar penerbitan event.'
      )
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'message' in err &&
        typeof (err as { message?: string }).message === 'string'
          ? (err as { message: string }).message
          : 'Gagal mencabut sertifikat dari server API.'
      notify('error', 'Gagal Mencabut Sertifikat', msg)
    }
  }

  const previewIndex = Math.max(
    1,
    recipients.findIndex((r) => r.id === activeRecipient.id) + 1
  )
  const previewCertificateNumber = formatCertificateNumber(
    selectedEvent?.slug || selectedEvent?.title || 'CNV',
    effectiveCategory,
    previewIndex
  )

  const handlePrintCurrentCertificate = () => {
    const recipientLabel =
      activeRecipient.type === 'group' && activeRecipient.groupName
        ? activeRecipient.groupName
        : activeRecipient.name
    printCertificateElement(
      'convena-certificate-canvas',
      `Sertifikat - ${recipientLabel} - ${selectedEvent?.title || 'Convena'}`,
      currentTemplate.orientation
    )
  }

  if (eventsLoading) {
    return (
      <div className="font-['Montserrat',sans-serif] bg-[#000000] text-white space-y-5 animate-pulse">
        <div className="h-10 w-80 bg-[#202020] rounded-xl" />
        <div className="h-20 w-full bg-[#151515] border border-[#262626] rounded-xl" />
        <div className="h-[460px] w-full bg-[#151515] border border-[#262626] rounded-2xl" />
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="py-16 text-center p-8 bg-[#151515] border border-[#3D3D3D]/60 rounded-xl max-w-lg mx-auto font-['Montserrat',sans-serif] text-white">
        <Calendar size={36} className="text-[#9C9C9C] mx-auto mb-3" />
        <h3 className="font-bold text-lg text-white mb-2">
          Belum Ada Event yang Tersedia
        </h3>
        <p className="text-xs text-[#9C9C9C] mb-6 leading-relaxed">
          Setiap sertifikat wajib terhubung dengan event spesifik. Silakan buat event terlebih dahulu untuk mulai mendesain dan menerbitkan e-sertifikat.
        </p>
        <Link to="/dashboard/events/create" className="no-underline">
          <Button variant="accent" size="md" icon={<Plus size={16} />}>
            Buat Event Pertama
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="font-['Montserrat',sans-serif] bg-[#000000] text-white pb-16 space-y-5">
      <Toast
        open={toast.open}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        position="bottom-right"
      />

      {/* PAGE HEADER */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="mb-1 flex items-center gap-1.5 flex-wrap">
            <Badge variant="accent" className="text-[10px] py-0 px-2">
              STUDIO SERTIFIKASI EVENT
            </Badge>
            <Badge variant="dark" className="text-[10px] py-0 px-2">
              QR SIGNATURE OTENTIK
            </Badge>
          </div>
          <h1 className="!text-lg sm:!text-xl font-extrabold !text-white tracking-tight m-0 !leading-snug">
            Desain & Penerbitan E-Sertifikat
          </h1>
          <p className="text-xs sm:text-sm text-[#9C9C9C] mt-1 mb-0 max-w-2xl">
            Kustomisasi template sertifikat berdasarkan event (warna, tipe bingkai, logo di dalam QR utama, tanda tangan QR pejabat/panitia) serta terbitkan untuk pemenang, peserta, maupun kelompok.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            variant="dark"
            size="sm"
            icon={
              editorExpanded ? (
                <Minimize2 size={14} className="text-[#CFFE06]" />
              ) : (
                <Maximize2 size={14} className="text-[#CFFE06]" />
              )
            }
            onClick={handleToggleExpandEditor}
          >
            {editorExpanded
              ? 'Tampilkan Sidebar'
              : 'Perluas Editor (Sembunyikan Sidebar)'}
          </Button>
          <Link to="/dashboard/verify" className="no-underline">
            <Button
              variant="secondary"
              size="sm"
              icon={<ShieldCheck size={14} />}
            >
              Cek Validasi Sertifikat
            </Button>
          </Link>
          <Button
            variant="accent"
            size="sm"
            icon={<Printer size={14} />}
            onClick={handlePrintCurrentCertificate}
          >
            Cetak / Simpan PDF
          </Button>
        </div>
      </div>

      {/* MANDATORY EVENT SELECTOR BAR (Certificate must be related to a specific event) */}
      <div className="p-4 bg-[#151515] border border-[#3D3D3D]/70 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#CFFE06]/15 border border-[#CFFE06]/40 text-[#CFFE06] flex items-center justify-center shrink-0">
            <Calendar size={18} />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#CFFE06]">
              Event Terhubung (Wajib)
            </div>
            <div className="text-sm sm:text-base font-extrabold text-white truncate">
              {selectedEvent?.title}
            </div>
            <div className="text-xs text-[#9C9C9C] truncate">
              {selectedEvent?.organizationName || 'Ormawa Kampus'} •{' '}
              {selectedEvent?.company || 'Universitas'} •{' '}
              <span className="capitalize">{selectedEvent?.category}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="w-full sm:w-44">
            <label className="block text-[10px] font-semibold text-[#9C9C9C] mb-1">
              Tanggal Terbit Sertifikat
            </label>
            <input
              type="text"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              placeholder="15 November 2026"
              className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#3D3D3D] focus:border-[#CFFE06] outline-none text-xs text-white"
            />
          </div>

          <div className="w-full sm:w-72">
            <Select
              label="Pilih Event Tujuan"
              value={selectedEventId}
              onChange={(val) => handleSelectEvent(String(val))}
              searchable
              searchPlaceholder="Cari nama event..."
              options={events.map((evt) => ({
                value: evt.id,
                label: evt.title,
                description: `${evt.organizationName || 'Ormawa'} • ${evt.company || 'Kampus'}`,
                badge: evt.category.toUpperCase(),
              }))}
            />
          </div>

          <button
            type="button"
            onClick={() => loadEventCertificationData(selectedEventId)}
            className="self-end h-[42px] px-3 rounded-xl bg-[#202020] border border-[#3D3D3D] text-[#9C9C9C] hover:text-[#CFFE06] hover:border-[#CFFE06] transition-colors flex items-center justify-center cursor-pointer"
            title="Muat ulang data event"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* SPLIT WORKSPACE: CONTROLS ON THE LEFT, STICKY LIVE PREVIEW ON THE RIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: CONTROLS & TABS */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-4 min-w-0">
          {/* MAIN WORKSPACE NAVIGATION TABS */}
          <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-[#151515] border border-[#3D3D3D]/70 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('design')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                activeTab === 'design'
                  ? 'bg-[#CFFE06] text-black shadow-[0_0_12px_rgba(207,254,6,0.25)]'
                  : 'bg-transparent text-[#CCCCCC] hover:bg-[#222222] hover:text-white'
              }`}
            >
              <PaintBucket size={14} className="shrink-0" />
              <span className="truncate">Desain</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('recipients')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                activeTab === 'recipients'
                  ? 'bg-[#CFFE06] text-black shadow-[0_0_12px_rgba(207,254,6,0.25)]'
                  : 'bg-transparent text-[#CCCCCC] hover:bg-[#222222] hover:text-white'
              }`}
            >
              <Users size={14} className="shrink-0" />
              <span className="truncate">Penerima ({recipients.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('issued')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                activeTab === 'issued'
                  ? 'bg-[#CFFE06] text-black shadow-[0_0_12px_rgba(207,254,6,0.25)]'
                  : 'bg-transparent text-[#CCCCCC] hover:bg-[#222222] hover:text-white'
              }`}
            >
              <Award size={14} className="shrink-0" />
              <span className="truncate">
                Terbit ({issuedCertificates.length})
              </span>
            </button>
          </div>

          {/* TAB CONTENT 1: TEMPLATE DESIGN EDITOR */}
          {activeTab === 'design' && (
            <TemplateEditor
              category={effectiveCategory}
              onCategoryChange={handleCategoryChange}
              template={currentTemplate}
              onChange={handleTemplateChange}
              onSaveTemplate={handleSaveTemplateToApi}
              savingTemplate={savingTemplate}
            />
          )}

          {/* TAB CONTENT 2: RECIPIENTS & GENERATION */}
          {activeTab === 'recipients' && (
            <RecipientsPanel
              eventTitle={selectedEvent?.title || 'Event Convena'}
              registrations={registrations}
              registrationsLoading={registrationsLoading}
              recipients={recipients}
              activeRecipientId={activeRecipient.id}
              onSelectRecipient={handleSelectRecipient}
              onAddRecipients={handleAddRecipients}
              onUpdateRecipient={handleUpdateRecipient}
              onRemoveRecipient={handleRemoveRecipient}
              onClearRecipients={() => setRecipients([])}
              onIssueAll={handleIssueCertificates}
              issuing={issuing}
              defaultCategory={effectiveCategory}
            />
          )}

          {/* TAB CONTENT 3: ISSUED CERTIFICATES FOR THIS EVENT */}
          {activeTab === 'issued' && (
            <div className="bg-[#151515] border border-[#3D3D3D]/60 rounded-xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white m-0">
                    Arsip Sertifikat Terbit — {selectedEvent?.title}
                  </h3>
                  <p className="text-xs text-[#9C9C9C] mt-0.5 mb-0">
                    Daftar sertifikat resmi yang terkait dengan event ini.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="accent"
                  size="sm"
                  icon={<Sparkles size={14} />}
                  onClick={() => setActiveTab('recipients')}
                >
                  Terbitkan Baru
                </Button>
              </div>

              {certificatesLoading ? (
                <div className="py-8 text-center text-xs text-[#9C9C9C]">
                  Memuat daftar sertifikat event dari server...
                </div>
              ) : issuedCertificates.length === 0 ? (
                <div className="p-6 rounded-xl bg-[#1B1B1B] border border-[#2C2C2C] text-center space-y-3">
                  <Award size={32} className="text-[#9C9C9C] mx-auto" />
                  <div className="text-sm font-bold text-white">
                    Belum Ada Sertifikat yang Diterbitkan pada Event Ini
                  </div>
                  <p className="text-xs text-[#9C9C9C] max-w-md mx-auto">
                    Anda dapat mengatur daftar penerima (peserta terdaftar, kelompok/tim, atau pemenang) pada tab <strong>Penerima</strong> lalu menerbitkannya.
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setActiveTab('recipients')}
                  >
                    Kelola Penerima & Terbitkan
                  </Button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {issuedCertificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="p-3.5 rounded-xl bg-[#1D1D1D] border border-[#303030] flex items-center justify-between gap-3 flex-wrap"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CheckCircle2 size={14} className="text-[#CFFE06]" />
                          <span className="font-bold text-sm text-white">
                            {cert.groupName || cert.recipientName}
                          </span>
                          <span className="font-mono text-xs text-[#CFFE06] bg-[#CFFE06]/10 px-2 py-0.5 rounded">
                            {cert.certificateNumber}
                          </span>
                          <Badge variant="dark">
                            {(cert.category || cert.role).toUpperCase()}
                          </Badge>
                          {cert.rank && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              🏆 {cert.rank}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#9C9C9C] mt-1">
                          Event:{' '}
                          <strong className="text-white">
                            {cert.eventTitle}
                          </strong>{' '}
                          • Tanggal: {cert.issueDate} •{' '}
                          {cert.signatories.length} Tanda Tangan QR
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          to={`/dashboard/verify/${encodeURIComponent(cert.certificateNumber)}`}
                          className="no-underline"
                        >
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            icon={<Eye size={13} />}
                          >
                            Verifikasi
                          </Button>
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleRevokeCertificate(cert.id)}
                          className="p-2 rounded-lg bg-[#281524] border border-[#DF00D0]/40 text-[#DF00D0] hover:bg-[#DF00D0] hover:text-white cursor-pointer"
                          title="Cabut / Hapus Sertifikat"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: STICKY LIVE CERTIFICATE PREVIEW STAGE */}
        <div className="lg:col-span-7 xl:col-span-7 lg:sticky lg:top-4 bg-[#151515] border border-[#3D3D3D]/70 rounded-2xl p-4 sm:p-5 space-y-4 min-w-0">
          {/* Preview Top Controls: Switch Recipient & Category Variation */}
          <div className="flex items-center justify-between gap-3 flex-wrap pb-3 border-b border-[#2A2A2A]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full bg-[#CFFE06]" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                Pratinjau Langsung Sertifikat
              </span>
              <Badge variant="accent">
                {effectiveCategory.toUpperCase()}
              </Badge>
              <span className="text-xs text-[#9C9C9C]">
                • {currentTemplate.signatories.length} Tanda Tangan QR
              </span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <label className="flex items-center gap-1.5 text-xs text-[#CCCCCC] cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSyncCategoryTemplate}
                  onChange={(e) =>
                    setAutoSyncCategoryTemplate(e.target.checked)
                  }
                  className="accent-[#CFFE06]"
                />
                <span>Otomatis Sesuaikan Desain per Kategori Penerima</span>
              </label>
            </div>
          </div>

          {/* Quick Recipient Switcher Bar for Experimentation */}
          {recipients.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-[11px] font-semibold text-[#9C9C9C] shrink-0">
                Uji Pratinjau Penerima:
              </span>
              {recipients.map((rec) => {
                const isSelected = rec.id === activeRecipient.id
                const label =
                  rec.type === 'group' && rec.groupName
                    ? rec.groupName
                    : rec.name
                return (
                  <button
                    key={rec.id}
                    type="button"
                    onClick={() => handleSelectRecipient(rec.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#CFFE06] text-black border-[#CFFE06]'
                        : 'bg-[#202020] text-[#CCCCCC] border-[#363636] hover:border-[#CFFE06]'
                    }`}
                  >
                    <span>{label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected
                          ? 'bg-black/20 text-black'
                          : 'bg-[#2C2C2C] text-[#9C9C9C]'
                      }`}
                    >
                      {rec.rank || rec.category}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {/* The Live Certificate Canvas */}
          <CertificateCanvas
            template={currentTemplate}
            certificateNumber={previewCertificateNumber}
            eventId={selectedEvent?.id || 'evt-convena'}
            eventTitle={selectedEvent?.title || 'Kegiatan Mahasiswa Convena'}
            organizationName={
              selectedEvent?.organizationName || 'Himpunan Mahasiswa'
            }
            company={
              activeRecipient.institution ||
              selectedEvent?.company ||
              'Institut Teknologi Bandung'
            }
            issueDate={issueDate}
            recipientName={activeRecipient.name}
            studentId={activeRecipient.studentId}
            institution={
              activeRecipient.institution || selectedEvent?.company || undefined
            }
            category={effectiveCategory}
            roleLabel={activeRecipient.roleLabel}
            rank={activeRecipient.rank}
            groupName={activeRecipient.groupName}
            groupMembers={activeRecipient.groupMembers}
            verified={true}
          />
        </div>
      </div>
    </div>
  )
}
