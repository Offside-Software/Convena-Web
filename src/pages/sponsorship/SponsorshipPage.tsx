import React, { useEffect, useState } from 'react'
import { Bot, Check, Handshake, Search, Sparkles, Target, Users, Wallet } from 'lucide-react'
import { Badge } from '../../components/common/Badge.tsx'
import { Button } from '../../components/common/Button.tsx'
import { Card } from '../../components/common/Card.tsx'
import { Modal } from '../../components/common/Modal.tsx'
import { Input } from '../../components/common/Input.tsx'
import { ProgressBar } from '../../components/common/ProgressBar.tsx'
import { Select } from '../../components/common/Select.tsx'
import { StatCard } from '../../components/domain/StatCard.tsx'
import { MemphisShape } from '../../components/shapes/MemphisShape.tsx'
import { sponsorshipService } from '../../services/sponsorship.service.ts'
import type { SponsorLead, SponsorPackage, PipelineStage } from '../../types/sponsorship.ts'

const formatCurrency = (value: number) => `Rp ${value.toLocaleString('id-ID')}`

export const SponsorshipPage: React.FC = () => {
  const [packages, setPackages] = useState<SponsorPackage[]>([])
  const [leads, setLeads] = useState<SponsorLead[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // AI Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const [aiCompany, setAiCompany] = useState('')
  const [aiContact, setAiContact] = useState('')
  const [aiPackage, setAiPackage] = useState('Platinum Sponsor')
  const [aiEvent, setAiEvent] = useState('Arkavidia 9.0: National Tech Festival')
  const [generatedDraft, setGeneratedDraft] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const loadData = async () => {
    const [pkgs, lds] = await Promise.all([sponsorshipService.getPackages(), sponsorshipService.getLeads()])
    setPackages(pkgs)
    setLeads(lds)
  }

  useEffect(() => {
    let isMounted = true
    Promise.all([sponsorshipService.getPackages(), sponsorshipService.getLeads()]).then(([pkgs, lds]) => {
      if (isMounted) {
        setPackages(pkgs)
        setLeads(lds)
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  const handleStageChange = async (leadId: string, newStage: PipelineStage) => {
    await sponsorshipService.updateStage(leadId, newStage)
    loadData()
  }

  const handleGenerateAi = async () => {
    if (!aiCompany || !aiContact) return
    setIsGenerating(true)
    const draft = await sponsorshipService.generateAIEmailDraft({
      companyName: aiCompany,
      contactPerson: aiContact,
      packageName: aiPackage,
      eventTitle: aiEvent,
    })
    setGeneratedDraft(draft)
    setIsGenerating(false)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedDraft)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const stages: { stage: PipelineStage; title: string; colorClass: string }[] = [
    { stage: 'prospect', title: 'Target Prospek', colorClass: 'bg-gray-200' },
    { stage: 'contacted', title: 'Sudah Dihubungi', colorClass: 'bg-[#BD93F9]' },
    { stage: 'proposal_sent', title: 'Proposal Terkirim', colorClass: 'bg-[#70E7FF]' },
    { stage: 'negotiating', title: 'Negosiasi MOU', colorClass: 'bg-[#FFF585]' },
    { stage: 'committed', title: 'Komitmen Deal', colorClass: 'bg-[#FF94BE]' },
    { stage: 'paid', title: 'Lunas / Transfer', colorClass: 'bg-[#00F5D4]' },
    { stage: 'rejected', title: 'Tidak Dilanjutkan', colorClass: 'bg-[#FF6F59]' },
  ]

  const activeLeads = leads.filter((lead) => lead.stage !== 'rejected')
  const closedLeads = leads.filter((lead) => lead.stage === 'committed' || lead.stage === 'paid')
  const totalCommitted = closedLeads.reduce((sum, lead) => sum + lead.value, 0)
  const totalPipeline = activeLeads.reduce((sum, lead) => sum + lead.value, 0)
  const totalSlots = packages.reduce((sum, pkg) => sum + pkg.slotLimit, 0)
  const filledSlots = packages.reduce((sum, pkg) => sum + pkg.slotsFilled, 0)
  const conversionRate = leads.length ? Math.round((closedLeads.length / leads.length) * 100) : 0
  const visibleLeads = leads.filter((lead) => {
    const query = searchQuery.trim().toLowerCase()
    return (
      !query ||
      lead.companyName.toLowerCase().includes(query) ||
      lead.contactPerson.toLowerCase().includes(query) ||
      lead.email.toLowerCase().includes(query)
    )
  })
  const committedByPackage = packages.map((pkg) => ({
    ...pkg,
    committedValue: closedLeads
      .filter((lead) => lead.packageInterest === pkg.name)
      .reduce((sum, lead) => sum + lead.value, 0),
  }))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="mb-1.5">
            <Badge variant="pink" tilt="left">
              CRM PIPELINE & MITRA
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-['Space_Grotesk',sans-serif] font-black text-[#121215] m-0">
            Sponsorship CRM
          </h1>
          <p className="text-gray-500 text-sm sm:text-base mt-1">
            Kelola relasi sponsor, pantau performa pipeline, dan siapkan proposal resmi dengan bantuan AI.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <MemphisShape type="starburst" size={40} color="#FFE600" animate="slow" className="hidden lg:inline-block" />
          <Button
            variant="pink"
            size="md"
            icon={<Bot size={18} />}
            onClick={() => {
              setIsAiModalOpen(true)
              setAiCompany('PT Shopee International')
              setAiContact('Bpk. Andi Wijaya')
            }}
          >
            Asisten Proposal AI
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          title="Total Calon Sponsor"
          value={leads.length}
          icon={<Users size={20} />}
          accentColor="yellow"
          subtitle="Semua lead terdaftar"
        />
        <StatCard
          title="Nilai Pipeline Aktif"
          value={formatCurrency(totalPipeline)}
          icon={<Target size={20} />}
          accentColor="cyan"
          subtitle={`${activeLeads.length} lead masih berjalan`}
        />
        <StatCard
          title="Sponsor Terkonfirmasi"
          value={formatCurrency(totalCommitted)}
          icon={<Wallet size={20} />}
          accentColor="pink"
          subtitle={`${closedLeads.length} deal komitmen / lunas`}
        />
        <StatCard
          title="Konversi Deal"
          value={`${conversionRate}%`}
          icon={<Handshake size={20} />}
          accentColor="mint"
          subtitle={`${filledSlots} dari ${totalSlots} kuota paket terisi`}
        />
      </div>

      {/* Sponsor Analytics */}
      <section aria-labelledby="sponsor-analytics-title">
        <div className="flex items-center gap-3 mb-4">
          <MemphisShape type="zigzag" size={40} color="#FF4B91" />
          <div>
            <Badge variant="cyan" tilt="left">ANALITIK SPONSOR</Badge>
            <h2 id="sponsor-analytics-title" className="text-xl sm:text-2xl font-black mt-2 mb-0">
              Performa Kemitraan
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <Card headerColor="yellow" headerTitle="Distribusi Pipeline">
            <div className="space-y-4">
              {stages.map((stage) => {
                const stageLeads = leads.filter((lead) => lead.stage === stage.stage)
                const stageValue = stageLeads.reduce((sum, lead) => sum + lead.value, 0)
                const share = leads.length ? (stageLeads.length / leads.length) * 100 : 0

                return (
                  <div key={stage.stage}>
                    <div className="flex justify-between items-baseline gap-3 mb-1">
                      <span className="text-xs font-bold text-[#121215]">{stage.title}</span>
                      <span className="text-xs text-gray-500 text-right">
                        {stageLeads.length} lead · {formatCurrency(stageValue)}
                      </span>
                    </div>
                    <div
                      className="h-3 w-full rounded-full border-2 border-[#121215] bg-[#FAF9F6] overflow-hidden shadow-[2px_2px_0px_0px_#121215]"
                      role="progressbar"
                      aria-label={`Proporsi ${stage.title}`}
                      aria-valuenow={Math.round(share)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div className={`h-full ${stage.colorClass}`} style={{ width: `${share}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card headerColor="pink" headerTitle="Kinerja Paket Sponsor">
            <div className="space-y-5">
              {committedByPackage.map((pkg) => (
                <div key={pkg.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                    <span className="text-sm font-black text-[#121215]">{pkg.name}</span>
                    <span className="text-xs text-gray-500">
                      {pkg.slotsFilled}/{pkg.slotLimit} slot · {formatCurrency(pkg.committedValue)}
                    </span>
                  </div>
                  <ProgressBar
                    value={pkg.slotsFilled}
                    max={pkg.slotLimit}
                    color={pkg.color === '#01CDFE' ? 'cyan' : pkg.color === '#FF4B91' ? 'pink' : pkg.color === '#00F5D4' ? 'mint' : 'yellow'}
                    showPercentage={false}
                    height={14}
                    className="mb-0"
                  />
                </div>
              ))}
              {packages.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">Belum ada data paket sponsor.</p>
              )}
            </div>
          </Card>
        </div>
      </section>

      {/* Package details */}
      <section aria-labelledby="package-slots-title">
        <div className="flex items-center gap-3 mb-4">
          <MemphisShape type="circle-dots" size={34} color="#01CDFE" />
          <h2 id="package-slots-title" className="text-xl sm:text-2xl font-black m-0">Paket & Kuota Sponsor</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {packages.map((pkg) => (
            <Card key={pkg.id} hoverable={false} className="relative">
              <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: pkg.color }} />
              <div className="flex justify-between items-start gap-2 mb-2">
                <h3 className="text-base font-black m-0">{pkg.name}</h3>
                <Badge variant="dark" className="text-[10px] shrink-0">
                  {pkg.slotsFilled}/{pkg.slotLimit}
                </Badge>
              </div>
              <div className="font-['Space_Grotesk',sans-serif] font-black text-xl text-[#121215] mb-2">
                {formatCurrency(pkg.price)}
              </div>
              <ProgressBar
                value={pkg.slotsFilled}
                max={pkg.slotLimit}
                color={pkg.color === '#01CDFE' ? 'cyan' : pkg.color === '#FF4B91' ? 'pink' : pkg.color === '#00F5D4' ? 'mint' : 'yellow'}
                label="Kuota terisi"
                height={14}
              />
              <ul className="pl-5 mt-3 mb-0 text-xs text-gray-600 space-y-1">
                {pkg.deliverables.slice(0, 3).map((deliverable) => (
                  <li key={deliverable}>{deliverable}</li>
                ))}
              </ul>
            </Card>
          ))}
          {packages.length === 0 && (
            <div className="sm:col-span-2 xl:col-span-4 rounded-xl border-2 border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
              Belum ada paket sponsor.
            </div>
          )}
        </div>
      </section>

      {/* Sponsorship CRM pipeline */}
      <section aria-labelledby="sponsor-pipeline-title">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <MemphisShape type="starburst" size={30} color="#FF4B91" animate="pulse" />
              <Badge variant="pink" tilt="right">CRM PIPELINE</Badge>
            </div>
            <h2 id="sponsor-pipeline-title" className="text-xl sm:text-2xl font-black m-0">
              Tahapan Pipeline Sponsorship
            </h2>
            <p className="text-sm text-gray-500 mt-1 mb-0">
              Nilai komitmen deal: <strong className="text-[#121215]">{formatCurrency(totalCommitted)}</strong>
            </p>
          </div>
          <label className="flex items-center gap-2.5 px-3 py-2 border-2 border-[#121215] rounded-lg bg-white shadow-[2px_2px_0px_0px_#121215] sm:w-72">
            <Search size={16} className="text-gray-500 shrink-0" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Cari perusahaan atau kontak..."
              aria-label="Cari perusahaan atau kontak sponsor"
              className="!border-none !shadow-none !p-0 !m-0 !bg-transparent text-sm focus:!outline-none focus:!ring-0"
            />
          </label>
        </div>

        {visibleLeads.length === 0 && (
          <div className="mb-4 rounded-xl border-2 border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
            {leads.length ? 'Tidak ada sponsor yang cocok dengan pencarian.' : 'Belum ada lead sponsor.'}
          </div>
        )}

        <div className="flex gap-4 overflow-x-auto items-start pb-3">
          {stages.map((stage) => {
            const stageLeads = visibleLeads.filter((lead) => lead.stage === stage.stage)
            return (
              <div
                key={stage.stage}
                className="bg-white border-2 border-[#121215] rounded-xl shadow-[4px_4px_0px_0px_#121215] p-3.5 flex flex-col gap-3 min-h-[300px] w-[250px] shrink-0"
              >
                <div className={`p-2 border-2 border-[#121215] rounded-lg flex justify-between items-center font-extrabold text-xs ${stage.colorClass} text-[#121215]`}>
                  <span>{stage.title}</span>
                  <span className="font-mono">{stageLeads.length}</span>
                </div>

                {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-3.5 border-2 border-[#121215] rounded-lg bg-[#FAF9F6] shadow-[2px_2px_0px_0px_#121215]"
                  >
                    <div className="font-black text-sm text-[#121215] mb-1">{lead.companyName}</div>
                    <div className="text-xs text-gray-500 mb-2">{lead.contactPerson}</div>
                    <div className="font-['Space_Grotesk',sans-serif] font-black text-sm text-[#121215] mb-2">
                      {formatCurrency(lead.value)}
                    </div>
                    {lead.notes && (
                      <p className="text-xs text-gray-600 m-0 mb-3 leading-relaxed">{lead.notes}</p>
                    )}
                    <select
                      value={lead.stage}
                      onChange={(event) => handleStageChange(lead.id, event.target.value as PipelineStage)}
                      aria-label={`Ubah tahap ${lead.companyName}`}
                      className="w-full text-xs py-1 px-2 rounded-md border border-[#121215] bg-white cursor-pointer font-semibold shadow-xs"
                    >
                      {stages.map((option) => (
                        <option key={option.stage} value={option.stage}>Pindah: {option.title}</option>
                      ))}
                    </select>
                  </div>
                ))}
                {stageLeads.length === 0 && (
                  <p className="text-xs text-gray-400 text-center mt-8">Belum ada lead di tahap ini.</p>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* AI Proposal Assistant Modal */}
      <Modal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        title="Asisten Surat Proposal AI"
        headerColor="pink"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsAiModalOpen(false)}>
              Tutup
            </Button>
            {generatedDraft && (
              <Button variant="yellow" size="sm" onClick={copyToClipboard} icon={<Check size={16} />}>
                {isCopied ? 'Tersalin!' : 'Salin Draf Surat'}
              </Button>
            )}
          </>
        }
      >
        <div className="flex flex-col space-y-4 gap-3">
          <p className="text-xs text-gray-500">
            Generate draf penawaran sponsorship resmi berstandar korporat Indonesia secara otomatis menggunakan LLM.
          </p>

          <Input
            label="Nama Perusahaan Calon Sponsor"
            value={aiCompany}
            onChange={(e) => setAiCompany(e.target.value)}
            className="!mb-0"
          />

          <Input
            label="Nama PIC / Kontak yang Dituju"
            value={aiContact}
            onChange={(e) => setAiContact(e.target.value)}
            className="!mb-0"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Kategori Paket Ditawarkan"
              options={[
                { label: 'Platinum Sponsor (Rp 35 jt)', value: 'Platinum Sponsor' },
                { label: 'Gold Sponsor (Rp 20 jt)', value: 'Gold Sponsor' },
                { label: 'Silver Sponsor (Rp 10 jt)', value: 'Silver Sponsor' },
              ]}
              value={aiPackage}
              onChange={(e) => setAiPackage(e.target.value)}
              className="!mb-0"
            />
            <Input
              label="Nama Kegiatan / Acara"
              value={aiEvent}
              onChange={(e) => setAiEvent(e.target.value)}
              className="!mb-0"
            />
          </div>

          <Button
            variant="pink"
            fullWidth
            onClick={handleGenerateAi}
            disabled={isGenerating || !aiCompany || !aiContact}
            icon={<Sparkles size={16} />}
            className="mt-2"
          >
            {isGenerating ? 'Menyusun Surat dengan AI...' : 'Buat Draf Surat Penawaran'}
          </Button>

          {generatedDraft && (
            <div className="pt-2">
              <label className="block font-['Space_Grotesk',sans-serif] font-bold text-xs uppercase tracking-wider text-[#121215] mb-1.5">
                Hasil Draf Surat (Siap Dikirim / Disunting):
              </label>
              <textarea
                rows={8}
                value={generatedDraft}
                onChange={(e) => setGeneratedDraft(e.target.value)}
                className="w-full p-3 bg-white border-2 border-[#121215] rounded-xl text-xs sm:text-sm font-mono leading-relaxed shadow-[2px_2px_0px_0px_#121215] focus:outline-none focus:border-[#FF4B91] transition-all"
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
