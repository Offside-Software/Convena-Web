import React, { useEffect, useState } from 'react'
import { Sparkles, Check, Bot } from 'lucide-react'
import { Badge } from '../../components/common/Badge.tsx'
import { Button } from '../../components/common/Button.tsx'
import { Modal } from '../../components/common/Modal.tsx'
import { Input } from '../../components/common/Input.tsx'
import { Select } from '../../components/common/Select.tsx'
import { sponsorshipService } from '../../services/sponsorship.service.ts'
import type { SponsorLead, SponsorPackage, PipelineStage } from '../../types/sponsorship.ts'

export const SponsorshipPage: React.FC = () => {
  const [packages, setPackages] = useState<SponsorPackage[]>([])
  const [leads, setLeads] = useState<SponsorLead[]>([])

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
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="mb-2">
            <Badge variant="accent">
              CRM PIPELINE & MITRA
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight m-0">
            Sponsorship CRM
          </h1>
          <p className="text-xs sm:text-sm text-[#9C9C9C] mt-1">
            Kelola tahapan penawaran sponsor, kuota paket, dan buat draf proposal dengan asisten AI.
          </p>
        </div>

        <Button
          variant="accent"
          size="md"
          icon={<Bot size={18} />}
          onClick={() => {
            setIsAiModalOpen(true)
            setAiCompany('PT Telkom Indonesia')
            setAiContact('Bpk. Hendra Gunawan')
          }}
        >
          Asisten Proposal AI
        </Button>
      </div>

      {/* Package slots summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="p-5 bg-[#151515] border border-[#3D3D3D]/60 rounded-xl relative overflow-hidden flex flex-col hover:border-[#CFFE06]/40 transition-colors"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-[#CFFE06]" />
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-bold text-white m-0">{pkg.name}</h3>
              <Badge variant="accent" className="text-[10px]">
                {pkg.slotsFilled} / {pkg.slotLimit} Terisi
              </Badge>
            </div>
            <div className="font-extrabold text-xl text-[#CFFE06] mb-3">
              Rp {pkg.price.toLocaleString('id-ID')}
            </div>
            <ul className="pl-4 m-0 text-xs text-[#9C9C9C] space-y-1">
              {pkg.deliverables.slice(0, 3).map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Pipeline Kanban Columns */}
      <h2 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2 flex-wrap">
        <Sparkles size={18} className="text-[#CFFE06]" /> Tahapan Pipeline Sponsorship
        <span className="text-xs text-[#9C9C9C] font-medium ml-2">
          (Total Masuk: Rp {totalCommitted.toLocaleString('id-ID')})
        </span>
      </h2>

      {/* Pipeline Kanban Columns - Horizontally Scrollable on all screen sizes */}
      <div className="flex gap-4 items-start overflow-x-auto pb-6 pt-1 scroll-smooth">
        {stages.map((stg) => {
          const stageLeads = leads.filter((l) => l.stage === stg.stage)
          return (
            <div
              key={stg.stage}
              className="bg-[#151515] border border-[#3D3D3D]/50 rounded-xl p-3.5 flex flex-col gap-3 min-h-[380px] w-[280px] min-w-[280px] shrink-0"
            >
              {/* Column Header */}
              <div
                className="p-2.5 bg-[#202020] border border-[#3D3D3D] rounded-lg flex justify-between items-center font-bold text-xs text-white"
              >
                <span>{stg.title}</span>
                <span className="font-mono text-[#CFFE06] bg-[#000000] px-2 py-0.5 rounded-full text-[11px]">
                  {stageLeads.length}
                </span>
              </div>

              {/* Lead Cards */}
              {stageLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-3.5 border border-[#3D3D3D]/60 rounded-xl bg-[#202020] hover:border-[#CFFE06]/40 transition-colors"
                >
                  <div className="font-bold text-sm text-white mb-0.5">
                    {lead.companyName}
                  </div>
                  <div className="text-xs text-[#9C9C9C] mb-2">
                    {lead.contactPerson}
                  </div>

                  <div className="font-bold text-sm text-[#CFFE06] mb-2">
                    Rp {lead.value.toLocaleString('id-ID')}
                  </div>

                  <p className="text-xs text-[#9C9C9C] m-0 mb-3 leading-relaxed">
                    {lead.notes}
                  </p>

                  {/* Stage mover selector */}
                  <select
                    value={lead.stage}
                    onChange={(e) => handleStageChange(lead.id, e.target.value as PipelineStage)}
                    className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-[#3D3D3D] bg-[#151515] text-white cursor-pointer font-medium focus:border-[#CFFE06] outline-none"
                  >
                    <option value="prospect">Pindah: Target Prospek</option>
                    <option value="proposal_sent">Pindah: Proposal Terkirim</option>
                    <option value="negotiating">Pindah: Negosiasi MOU</option>
                    <option value="committed">Pindah: Komitmen Deal</option>
                    <option value="paid">Pindah: Lunas / Transfer</option>
                  </select>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* AI Proposal Assistant Modal */}
      <Modal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        title="Asisten Proposal Sponsorship AI"
        maxWidth="max-w-[560px]"
      >
        <div className="space-y-4 font-['Montserrat',sans-serif]">
          <p className="text-xs text-[#9C9C9C] m-0">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Paket Sponsorship Ditawarkan"
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
            variant="accent"
            fullWidth
            onClick={handleGenerateAi}
            disabled={isGenerating || !aiCompany || !aiContact}
            icon={<Sparkles size={16} />}
          >
            {isGenerating ? 'Menyusun Surat dengan AI...' : 'Generate Draf Surat Penawaran'}
          </Button>

          {generatedDraft && (
            <div className="pt-2">
              <label className="block font-bold text-xs text-[#9C9C9C] mb-1.5">
                Hasil Draf Surat:
              </label>
              <textarea
                rows={8}
                value={generatedDraft}
                onChange={(e) => setGeneratedDraft(e.target.value)}
                className="w-full p-3 bg-[#1c1c1c] border border-[#333333] rounded-xl text-xs font-mono leading-relaxed text-white focus:outline-none focus:border-[#CFFE06] transition-all"
              />
              <div className="mt-3 flex justify-end">
                <Button variant="accent" size="sm" onClick={copyToClipboard} icon={<Check size={15} />}>
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
