import React, { useEffect, useState } from 'react'
import { Sparkles, Check, Bot } from 'lucide-react'
import { Badge } from '../../components/common/Badge.tsx'
import { Button } from '../../components/common/Button.tsx'
import { Modal } from '../../components/common/Modal.tsx'
import { Input } from '../../components/common/Input.tsx'
import { Select } from '../../components/common/Select.tsx'
import { sponsorshipService } from '../../services/sponsorship.service.ts'
import type { SponsorLead, SponsorPackage, PipelineStage } from '../../types/sponsorship.ts'
import { SearchBar } from '../../components/common/SearchBar.tsx'

export const SponsorshipPage: React.FC = () => {
  const [packages, setPackages] = useState<SponsorPackage[]>([])
  const [leads, setLeads] = useState<SponsorLead[]>([])
  const [loading, setLoading] = useState(true)
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
    Promise.all([sponsorshipService.getPackages(), sponsorshipService.getLeads()])
      .then(([pkgs, lds]) => {
        if (isMounted) {
          setPackages(pkgs)
          setLeads(lds)
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false)
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
    try {
      const draft = await sponsorshipService.generateAIEmailDraft({
        companyName: aiCompany,
        contactPerson: aiContact,
        packageName: aiPackage,
        eventTitle: aiEvent,
      })
      setGeneratedDraft(draft)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedDraft)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const stages: { stage: PipelineStage; title: string; color: string }[] = [
    { stage: 'prospect', title: 'Target Prospek', color: '#9C9C9C' },
    { stage: 'proposal_sent', title: 'Proposal Terkirim', color: '#CFFE06' },
    { stage: 'negotiating', title: 'Negosiasi MOU', color: '#DF00D0' },
    { stage: 'committed', title: 'Komitmen Deal', color: '#CFFE06' },
    { stage: 'paid', title: 'Lunas / Transfer', color: '#CFFE06' },
  ]

  const totalCommitted = leads
    .filter((l) => l.stage === 'committed' || l.stage === 'paid')
    .reduce((sum, l) => sum + l.value, 0)

  return (
    <div className="font-['Montserrat',sans-serif] bg-[#000000] text-white">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <div className="mb-1">
            <Badge variant="accent" className="text-[10px] py-0 px-2">
              CRM PIPELINE & MITRA
            </Badge>
          </div>
          <h1 className="!text-lg sm:!text-xl font-extrabold !text-white tracking-tight m-0 !leading-snug">
            Sponsorship CRM
          </h1>
          <p className="!text-xs !text-[#9C9C9C] mt-0.5 m-0 !leading-normal">
            Kelola tahapan penawaran sponsor, kuota paket, dan buat draf proposal dengan asisten AI.
          </p>
        </div>

        <Button
          variant="accent"
          size="sm"
          className="!py-1.5 !px-3 !text-xs"
          icon={<Bot size={14} />}
          onClick={() => {
            setIsAiModalOpen(true)
            setAiCompany('PT Telkom Indonesia')
            setAiContact('Bpk. Hendra Gunawan')
          }}
        >
          Asisten Proposal AI
        </Button>
      </div>

      {loading ? (
        <div className="space-y-6 animate-pulse">
          {/* Package slots skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-3 bg-[#151515] border border-[#262626] rounded-xl space-y-2"
              >
                <div className="flex justify-between items-center">
                  <div className="h-4 w-32 bg-[#262626] rounded" />
                  <div className="h-3.5 w-16 bg-[#242424] rounded-full" />
                </div>
                <div className="h-6 w-36 bg-[#262626] rounded" />
                <div className="space-y-1.5 pt-1">
                  <div className="h-2.5 w-full bg-[#202020] rounded" />
                  <div className="h-2.5 w-5/6 bg-[#202020] rounded" />
                  <div className="h-2.5 w-4/6 bg-[#202020] rounded" />
                </div>
              </div>
            ))}
          </div>

          {/* Pipeline Kanban Skeleton */}
          <div className="space-y-3">
            <div className="h-5 w-56 bg-[#262626] rounded" />
            <div className="flex gap-3 items-start overflow-x-auto pb-3">
              {[1, 2, 3, 4, 5].map((col) => (
                <div
                  key={col}
                  className="bg-[#151515] border border-[#262626] rounded-xl p-2.5 flex flex-col gap-2.5 min-h-[300px] w-[250px] min-w-[250px] shrink-0"
                >
                  <div className="p-2 bg-[#202020] border border-[#262626] rounded-lg flex justify-between items-center">
                    <div className="h-3.5 w-24 bg-[#2c2c2c] rounded" />
                    <div className="h-3.5 w-5 bg-[#2c2c2c] rounded-full" />
                  </div>
                  {[1, 2].map((card) => (
                    <div
                      key={card}
                      className="p-2.5 border border-[#262626] rounded-xl bg-[#202020] space-y-2"
                    >
                      <div className="h-3.5 w-36 bg-[#2c2c2c] rounded" />
                      <div className="h-3 w-28 bg-[#262626] rounded" />
                      <div className="h-3.5 w-24 bg-[#2c2c2c] rounded" />
                      <div className="h-2.5 w-full bg-[#262626] rounded" />
                      <div className="h-7 w-full bg-[#151515] rounded-lg" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Package slots summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="p-3 bg-[#151515] border border-[#3D3D3D]/60 rounded-xl relative overflow-hidden flex flex-col hover:border-[#CFFE06]/40 transition-colors"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-[#CFFE06]" />
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-xs sm:text-sm font-bold text-white m-0">{pkg.name}</h3>
                  <Badge variant="accent" className="text-[10px] py-0 px-1.5">
                    {pkg.slotsFilled} / {pkg.slotLimit} Terisi
                  </Badge>
                </div>
                <div className="font-extrabold text-base sm:text-lg text-[#CFFE06] mb-1.5">
                  Rp {pkg.price.toLocaleString('id-ID')}
                </div>
                <ul className="pl-4 m-0 text-[11px] text-[#9C9C9C] space-y-0.5">
                  {pkg.deliverables.slice(0, 3).map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Pipeline Kanban Columns */}
          <div className="mb-3 flex items-center justify-between flex-wrap gap-2.5">
            <h2 className="!text-sm sm:!text-base font-bold text-white m-0 flex items-center gap-2">
              <Sparkles size={16} className="text-[#CFFE06]" /> Tahapan Pipeline Sponsorship
              <span className="text-xs text-[#9C9C9C] font-medium ml-1">
                (Total Masuk: Rp {totalCommitted.toLocaleString('id-ID')})
              </span>
            </h2>

            <div className="w-full sm:w-64">
              <SearchBar
                placeholder="Cari sponsor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                showSubmitButton={false}
                clearable
              />
            </div>
          </div>

          {/* Pipeline Kanban Columns - Horizontally Scrollable on all screen sizes */}
          <div className="flex gap-3 items-start overflow-x-auto pb-3 pt-0.5 scroll-smooth">
            {stages.map((stg) => {
              const stageLeads = leads.filter((l) => {
                const matchesStage = l.stage === stg.stage

                const matchesSearch =
                  l.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  l.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  l.notes.toLowerCase().includes(searchQuery.toLowerCase())

                return matchesStage && matchesSearch
              })
              return (
                <div
                  key={stg.stage}
                  className="bg-[#151515] border border-[#3D3D3D]/50 rounded-xl p-2.5 flex flex-col gap-2.5 min-h-[300px] w-[250px] min-w-[250px] shrink-0"
                >
                  {/* Column Header */}
                  <div
                    className="p-2 bg-[#202020] border border-[#3D3D3D] rounded-lg flex justify-between items-center font-bold text-xs text-white"
                  >
                    <span>{stg.title}</span>
                    <span className="font-mono text-[#CFFE06] bg-[#000000] px-1.5 py-0.2 rounded-full text-[10px]">
                      {stageLeads.length}
                    </span>
                  </div>

                  {/* Lead Cards */}
                  {stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-2.5 border border-[#3D3D3D]/60 rounded-xl bg-[#202020] hover:border-[#CFFE06]/40 transition-colors"
                    >
                      <div className="font-bold text-xs text-white mb-0.5 truncate">
                        {lead.companyName}
                      </div>
                      <div className="text-[11px] text-[#9C9C9C] mb-1 truncate">
                        {lead.contactPerson}
                      </div>

                      <div className="font-bold text-xs text-[#CFFE06] mb-1.5">
                        Rp {lead.value.toLocaleString('id-ID')}
                      </div>

                      <p className="!text-[11px] !text-[#9C9C9C] m-0 mb-2 !leading-snug line-clamp-3">
                        {lead.notes}
                      </p>

                      {/* Stage mover selector */}
                      <Select
                        value={lead.stage}
                        onChange={(stage) => handleStageChange(lead.id, stage as PipelineStage)}
                        options={[
                          { label: 'Pindah: Target Prospek', value: 'prospect' },
                          { label: 'Pindah: Proposal Terkirim', value: 'proposal_sent' },
                          { label: 'Pindah: Negosiasi MOU', value: 'negotiating' },
                          { label: 'Pindah: Komitmen Deal', value: 'committed' },
                          { label: 'Pindah: Lunas / Transfer', value: 'paid' },
                        ]}
                        size="sm"
                        variant="surface"
                        className="!mb-0 !py-1 !text-[11px]"
                      />
                    </div>
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="py-6 text-center text-[11px] text-[#666666]">
                      Belum ada mitra
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* AI Proposal Assistant Modal */}
      <Modal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        title="Asisten Proposal Sponsorship AI"
        maxWidth="max-w-[520px]"
      >
        <div className="space-y-3 font-['Montserrat',sans-serif]">
          <p className="!text-xs !text-[#9C9C9C] m-0 !leading-snug">
            Generate draf penawaran sponsorship resmi berstandar korporat Indonesia secara otomatis menggunakan kecerdasan buatan.
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Paket Sponsorship Ditawarkan"
              options={[
                { label: 'Platinum Sponsor (Rp 35 jt)', value: 'Platinum Sponsor' },
                { label: 'Gold Sponsor (Rp 20 jt)', value: 'Gold Sponsor' },
                { label: 'Silver Sponsor (Rp 10 jt)', value: 'Silver Sponsor' },
              ]}
              value={aiPackage}
              onChange={(val) => setAiPackage(val)}
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
            variant="accent"
            fullWidth
            size="sm"
            onClick={handleGenerateAi}
            disabled={isGenerating || !aiCompany || !aiContact}
            icon={<Sparkles size={14} />}
            className="!py-2 !text-xs"
          >
            {isGenerating ? 'Menyusun Surat dengan AI...' : 'Generate Draf Surat Penawaran'}
          </Button>

          {generatedDraft && (
            <div className="pt-1">
              <label className="block font-bold text-[11px] text-[#9C9C9C] mb-1">
                Hasil Draf Surat:
              </label>
              <textarea
                rows={5}
                value={generatedDraft}
                onChange={(e) => setGeneratedDraft(e.target.value)}
                className="w-full p-2.5 bg-[#1c1c1c] border border-[#333333] rounded-lg text-xs font-mono leading-relaxed text-white focus:outline-none focus:border-[#CFFE06] transition-all"
              />
              <div className="mt-2 flex justify-end">
                <Button variant="accent" size="sm" className="!py-1 !px-2.5 !text-xs" onClick={copyToClipboard} icon={<Check size={13} />}>
                  {isCopied ? 'Tersalin ke Clipboard!' : 'Salin Draf Surat'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
