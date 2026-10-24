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

  const stages: { stage: PipelineStage; title: string; colorClass: string }[] = [
    { stage: 'prospect', title: 'Target Prospek', colorClass: 'bg-gray-200' },
    { stage: 'proposal_sent', title: 'Proposal Terkirim', colorClass: 'bg-[#70E7FF]' },
    { stage: 'negotiating', title: 'Negosiasi MOU', colorClass: 'bg-[#FFF585]' },
    { stage: 'committed', title: 'Komitmen Deal', colorClass: 'bg-[#FF94BE]' },
    { stage: 'paid', title: 'Lunas / Transfer', colorClass: 'bg-[#00F5D4]' },
  ]

  const totalCommitted = leads
    .filter((l) => l.stage === 'committed' || l.stage === 'paid')
    .reduce((sum, l) => sum + l.value, 0)

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
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
            Kelola tahapan penawaran sponsor, kuota paket, dan buat draf penawaran proposal resmi dengan bantuan AI.
          </p>
        </div>

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
          Asisten Proposal AI ✨
        </Button>
      </div>

      {/* Package slots summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="p-5 bg-white border-2 border-[#121215] rounded-xl shadow-[4px_4px_0px_0px_#121215] relative overflow-hidden flex flex-col"
          >
            <div
              className={`absolute top-0 left-0 w-full h-1.5 ${
                pkg.color === '#FFE600'
                  ? 'bg-[#FFE600]'
                  : pkg.color === '#01CDFE'
                    ? 'bg-[#01CDFE]'
                    : pkg.color === '#FF4B91'
                      ? 'bg-[#FF4B91]'
                      : 'bg-[#FFE600]'
              }`}
            />
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-['Space_Grotesk',sans-serif] font-black text-[#121215] m-0">{pkg.name}</h3>
              <Badge variant="dark" className="text-[11px]">
                {pkg.slotsFilled} / {pkg.slotLimit} Terisi
              </Badge>
            </div>
            <div className="font-['Space_Grotesk',sans-serif] font-black text-2xl text-[#121215] mb-3">
              Rp {pkg.price.toLocaleString('id-ID')}
            </div>
            <ul className="pl-5 m-0 text-xs text-gray-600 space-y-1">
              {pkg.deliverables.slice(0, 3).map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Pipeline Kanban Columns */}
      <h2 className="text-xl sm:text-2xl font-['Space_Grotesk',sans-serif] font-black text-[#121215] mb-4 flex items-center gap-2 flex-wrap">
        <Sparkles size={20} className="text-[#FF4B91]" /> Tahapan Pipeline Sponsorship
        <span className="text-sm text-gray-500 font-semibold">
          (Total Masuk: Rp {totalCommitted.toLocaleString('id-ID')})
        </span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
        {stages.map((stg) => {
          const stageLeads = leads.filter((l) => l.stage === stg.stage)
          return (
            <div
              key={stg.stage}
              className="bg-white border-2 border-[#121215] rounded-xl shadow-[4px_4px_0px_0px_#121215] p-3.5 flex flex-col gap-3 min-h-[380px]"
            >
              {/* Column Header */}
              <div
                className={`p-2 border-2 border-[#121215] rounded-lg flex justify-between items-center font-extrabold text-xs ${stg.colorClass} text-[#121215]`}
              >
                <span>{stg.title}</span>
                <span className="font-mono">{stageLeads.length}</span>
              </div>

              {/* Lead Cards */}
              {stageLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-3.5 border-2 border-[#121215] rounded-lg bg-[#FAF9F6] shadow-[2px_2px_0px_0px_#121215]"
                >
                  <div className="font-black text-sm text-[#121215] mb-1">
                    {lead.companyName}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {lead.contactPerson}
                  </div>

                  <div className="font-['Space_Grotesk',sans-serif] font-black text-sm text-[#121215] mb-2">
                    Rp {lead.value.toLocaleString('id-ID')}
                  </div>

                  <p className="text-xs text-gray-600 m-0 mb-3 leading-relaxed">
                    {lead.notes}
                  </p>

                  {/* Stage mover selector */}
                  <select
                    value={lead.stage}
                    onChange={(e) => handleStageChange(lead.id, e.target.value as PipelineStage)}
                    className="w-full text-xs py-1 px-2 rounded-md border border-[#121215] bg-white cursor-pointer font-semibold shadow-xs"
                  >
                    <option value="prospect">Pindah: Prospek</option>
                    <option value="proposal_sent">Pindah: Proposal Sent</option>
                    <option value="negotiating">Pindah: Negosiasi</option>
                    <option value="committed">Pindah: Komitmen</option>
                    <option value="paid">Pindah: Lunas</option>
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
        title="Asisten Surat Proposal AI 🤖"
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
        <div className="space-y-4">
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
