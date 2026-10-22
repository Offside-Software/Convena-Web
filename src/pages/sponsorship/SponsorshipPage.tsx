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
    { stage: 'prospect', title: 'Target Prospek', color: 'var(--mem-gray-200)' },
    { stage: 'proposal_sent', title: 'Proposal Terkirim', color: 'var(--mem-cyan-light)' },
    { stage: 'negotiating', title: 'Negosiasi MOU', color: 'var(--mem-yellow-light)' },
    { stage: 'committed', title: 'Komitmen Deal', color: 'var(--mem-pink-light)' },
    { stage: 'paid', title: 'Lunas / Transfer', color: 'var(--mem-mint)' },
  ]

  const totalCommitted = leads
    .filter((l) => l.stage === 'committed' || l.stage === 'paid')
    .reduce((sum, l) => sum + l.value, 0)

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <Badge variant="pink" tilt="left" style={{ marginBottom: '0.4rem' }}>
            CRM PIPELINE & MITRA
          </Badge>
          <h1 style={{ fontSize: '2.4rem', margin: 0 }}>Sponsorship CRM</h1>
          <p style={{ color: 'var(--mem-gray-500)', margin: '4px 0 0' }}>
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
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="memphis-box"
            style={{
              padding: '1.25rem',
              backgroundColor: '#FFFFFF',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '6px',
                backgroundColor: pkg.color,
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', margin: 0 }}>{pkg.name}</h3>
              <Badge variant="dark" style={{ fontSize: '0.7rem' }}>
                {pkg.slotsFilled} / {pkg.slotLimit} Terisi
              </Badge>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: '1.5rem',
                color: 'var(--mem-dark)',
                marginBottom: '0.75rem',
              }}
            >
              Rp {pkg.price.toLocaleString('id-ID')}
            </div>
            <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.8rem', color: '#4B5563' }}>
              {pkg.deliverables.slice(0, 3).map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Pipeline Kanban Columns */}
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Sparkles size={20} style={{ color: 'var(--mem-pink)' }} /> Tahapan Pipeline Sponsorship
        <span style={{ fontSize: '0.9rem', color: 'var(--mem-gray-500)', fontWeight: 600 }}>
          (Total Masuk: Rp {totalCommitted.toLocaleString('id-ID')})
        </span>
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          alignItems: 'start',
        }}
      >
        {stages.map((stg) => {
          const stageLeads = leads.filter((l) => l.stage === stg.stage)
          return (
            <div
              key={stg.stage}
              className="memphis-box"
              style={{
                backgroundColor: '#FFFFFF',
                padding: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                minHeight: '380px',
              }}
            >
              {/* Column Header */}
              <div
                style={{
                  padding: '0.5rem',
                  backgroundColor: stg.color,
                  border: '1.5px solid var(--mem-dark)',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                }}
              >
                <span>{stg.title}</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{stageLeads.length}</span>
              </div>

              {/* Lead Cards */}
              {stageLeads.map((lead) => (
                <div
                  key={lead.id}
                  style={{
                    padding: '0.85rem',
                    border: '2px solid var(--mem-dark)',
                    borderRadius: '8px',
                    backgroundColor: 'var(--mem-bg)',
                    boxShadow: '2px 2px 0px var(--mem-dark)',
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                    {lead.companyName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--mem-gray-500)', marginBottom: '0.5rem' }}>
                    {lead.contactPerson}
                  </div>

                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 900,
                      fontSize: '0.95rem',
                      color: 'var(--mem-dark)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Rp {lead.value.toLocaleString('id-ID')}
                  </div>

                  <p style={{ fontSize: '0.75rem', color: '#4B5563', margin: '0 0 0.75rem' }}>
                    {lead.notes}
                  </p>

                  {/* Stage mover selector */}
                  <select
                    value={lead.stage}
                    onChange={(e) => handleStageChange(lead.id, e.target.value as PipelineStage)}
                    style={{
                      fontSize: '0.75rem',
                      padding: '3px 6px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
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
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--mem-gray-500)', marginBottom: '1rem' }}>
            Generate draf penawaran sponsorship resmi berstandar korporat Indonesia secara otomatis menggunakan LLM.
          </p>

          <Input
            label="Nama Perusahaan Calon Sponsor"
            value={aiCompany}
            onChange={(e) => setAiCompany(e.target.value)}
          />

          <Input
            label="Nama PIC / Kontak yang Dituju"
            value={aiContact}
            onChange={(e) => setAiContact(e.target.value)}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <Select
              label="Kategori Paket Ditawarkan"
              options={[
                { label: 'Platinum Sponsor (Rp 35 jt)', value: 'Platinum Sponsor' },
                { label: 'Gold Sponsor (Rp 20 jt)', value: 'Gold Sponsor' },
                { label: 'Silver Sponsor (Rp 10 jt)', value: 'Silver Sponsor' },
              ]}
              value={aiPackage}
              onChange={(e) => setAiPackage(e.target.value)}
            />
            <Input label="Nama Kegiatan / Acara" value={aiEvent} onChange={(e) => setAiEvent(e.target.value)} />
          </div>

          <Button
            variant="pink"
            fullWidth
            onClick={handleGenerateAi}
            disabled={isGenerating || !aiCompany || !aiContact}
            icon={<Sparkles size={16} />}
            style={{ marginBottom: '1.25rem' }}
          >
            {isGenerating ? 'Menyusun Surat dengan AI...' : 'Buat Draf Surat Penawaran'}
          </Button>

          {generatedDraft && (
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  marginBottom: '0.35rem',
                }}
              >
                Hasil Draf Surat (Siap Dikirim / Disunting):
              </label>
              <textarea
                rows={8}
                value={generatedDraft}
                onChange={(e) => setGeneratedDraft(e.target.value)}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                  lineHeight: 1.6,
                }}
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
