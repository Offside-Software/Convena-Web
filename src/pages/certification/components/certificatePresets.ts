import type {
  BorderStyle,
  CertificateCategory,
  CertificateColors,
  CertificateTemplateDesign,
  SignatorySlot,
} from '../../../types/certificate.ts'

// Built-in SVG logos encoded as Base64 Data URLs so they work inside QRCodeCanvas / QRCodeSVG and PNG exports
export const SAMPLE_CONVENA_LOGO_BASE64 =
  'data:image/svg+xml;base64,' +
  btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <rect width="120" height="120" rx="28" fill="#0A0A0A"/>
      <rect x="6" y="6" width="108" height="108" rx="22" fill="none" stroke="#CFFE06" stroke-width="6"/>
      <path d="M74 36H50C41.163 36 34 43.163 34 52V68C34 76.837 41.163 84 50 84H74" fill="none" stroke="#CFFE06" stroke-width="12" stroke-linecap="round"/>
      <circle cx="76" cy="60" r="10" fill="#DF00D0"/>
    </svg>`
  )

export const SAMPLE_CAMPUS_CREST_BASE64 =
  'data:image/svg+xml;base64,' +
  btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <circle cx="60" cy="60" r="56" fill="#1E3A8A" stroke="#F59E0B" stroke-width="6"/>
      <polygon points="60,22 92,40 60,58 28,40" fill="#F59E0B"/>
      <path d="M38 48V74C38 82 60 90 60 90C60 90 82 82 82 74V48" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round"/>
    </svg>`
  )

export const SAMPLE_TROPHY_CREST_BASE64 =
  'data:image/svg+xml;base64,' +
  btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <rect width="120" height="120" rx="60" fill="#181204"/>
      <circle cx="60" cy="60" r="54" fill="none" stroke="#F59E0B" stroke-width="5"/>
      <path d="M42 34H78V54C78 64 70 72 60 72C50 72 42 64 42 54V34Z" fill="#F59E0B"/>
      <rect x="54" y="72" width="12" height="14" fill="#F59E0B"/>
      <rect x="42" y="86" width="36" height="8" rx="4" fill="#FDE68A"/>
    </svg>`
  )

export interface ColorPalettePreset {
  id: string
  name: string
  description: string
  colors: CertificateColors
}

export const COLOR_PALETTES: ColorPalettePreset[] = [
  {
    id: 'convena-neon',
    name: 'Convena Neon',
    description: 'Hitam pekat dengan aksen hijau limau khas Convena',
    colors: {
      background: '#0D0D0D',
      surface: '#161616',
      primary: '#CFFE06',
      accent: '#DF00D0',
      text: '#FFFFFF',
      mutedText: '#A3A3A3',
    },
  },
  {
    id: 'gold-prestige',
    name: 'Emas Juara Eksklusif',
    description: 'Obsidian mewah dengan bingkai emas penghargaan juara',
    colors: {
      background: '#110F0A',
      surface: '#1C1810',
      primary: '#F59E0B',
      accent: '#FDE68A',
      text: '#FFFBEB',
      mutedText: '#D6C79C',
    },
  },
  {
    id: 'ivory-academic',
    name: 'Putih Akademik Rektorat',
    description: 'Kertas gading formal dengan biru tua & emas institusi',
    colors: {
      background: '#FAF7F0',
      surface: '#F0ECE1',
      primary: '#1E3A8A',
      accent: '#B45309',
      text: '#111827',
      mutedText: '#4B5563',
    },
  },
  {
    id: 'cyber-blue',
    name: 'Biru Teknologi & Seminar',
    description: 'Biru malam modern dengan aksen siber elektrik',
    colors: {
      background: '#081021',
      surface: '#101D38',
      primary: '#38BDF8',
      accent: '#818CF8',
      text: '#F8FAFC',
      mutedText: '#94A3B8',
    },
  },
  {
    id: 'royal-magenta',
    name: 'Magenta Kreatif & Festival',
    description: 'Ungu gelap artistik dengan sorotan magenta terang',
    colors: {
      background: '#130916',
      surface: '#1F1024',
      primary: '#DF00D0',
      accent: '#CFFE06',
      text: '#FDF4FF',
      mutedText: '#D8B4FE',
    },
  },
  {
    id: 'emerald-campus',
    name: 'Emerald Kepanitiaan',
    description: 'Hijau zamrud elegan untuk apresiasi panitia & delegasi',
    colors: {
      background: '#071712',
      surface: '#0F2920',
      primary: '#10B981',
      accent: '#6EE7B7',
      text: '#ECFDF5',
      mutedText: '#A7F3D0',
    },
  },
]

export const BORDER_STYLE_OPTIONS: Array<{
  value: BorderStyle
  label: string
  description: string
}> = [
  {
    value: 'rounded',
    label: 'Sudut Melengkung (Round)',
    description: 'Bingkai modern dengan sudut melengkung halus',
  },
  {
    value: 'flat',
    label: 'Sudut Tegas (Flat)',
    description: 'Bingkai siku tajam 90° bergaya arsitektural',
  },
  {
    value: 'double',
    label: 'Garis Ganda Klasik (Double)',
    description: 'Bingkai garis ganda formal khas piagam akademik',
  },
  {
    value: 'ornate',
    label: 'Ornamen Dekoratif (Ornate)',
    description: 'Bingkai piagam dengan aksen ornamen di keempat sudut',
  },
  {
    value: 'minimal',
    label: 'Minimalis Modern (Minimal)',
    description: 'Garis aksen tebal di bagian atas & bawah sertifikat',
  },
  {
    value: 'none',
    label: 'Tanpa Bingkai (Frameless)',
    description: 'Kanvas bersih tanpa garis tepi luar',
  },
]

export const CERTIFICATE_CATEGORIES: Array<{
  value: CertificateCategory
  label: string
  shortLabel: string
  description: string
  badge: string
}> = [
  {
    value: 'winner',
    label: 'Pemenang / Juara Kompetisi',
    shortLabel: 'Pemenang',
    description: 'Piagam khusus juara lomba, best speaker, atau finalis terbaik',
    badge: 'JUARA',
  },
  {
    value: 'attendance',
    label: 'Peserta / Kehadiran (Attendance)',
    shortLabel: 'Peserta',
    description: 'Sertifikat tanda partisipasi dan kehadiran peserta kegiatan',
    badge: 'PESERTA',
  },
  {
    value: 'group',
    label: 'Kelompok / Tim / Delegasi',
    shortLabel: 'Tim / Grup',
    description: 'Sertifikat kolektif untuk tim lomba, kelompok riset, atau delegasi',
    badge: 'KELOMPOK',
  },
  {
    value: 'speaker',
    label: 'Pembicara / Narasumber',
    shortLabel: 'Pembicara',
    description: 'Penghargaan apresiasi untuk narasumber, moderator, atau juri',
    badge: 'NARASUMBER',
  },
  {
    value: 'committee',
    label: 'Panitia Pelaksana / Volunteer',
    shortLabel: 'Panitia',
    description: 'Sertifikat dedikasi pengurus kepanitiaan dan relawan acara',
    badge: 'PANITIA',
  },
  {
    value: 'custom',
    label: 'Eksperimen Kustom Bebas',
    shortLabel: 'Kustom',
    description: 'Template fleksibel untuk sponsor, mitra, atau kategori khusus lainnya',
    badge: 'KUSTOM',
  },
]

export const QUICK_SIGNATORY_PRESETS: Array<{
  title: string
  defaultName: string
  defaultIdNumber: string
}> = [
  {
    title: 'Ketua Pelaksana',
    defaultName: 'M. Rizky Pratama',
    defaultIdNumber: 'NIM. 13522089',
  },
  {
    title: 'Rektor Universitas',
    defaultName: 'Prof. Dr. Ir. Hendra Wijaya, M.Sc.',
    defaultIdNumber: 'NIP. 196804121994031002',
  },
  {
    title: 'Wakil Rektor Bidang Kemahasiswaan',
    defaultName: 'Dr. Eng. Ratna Kusuma, S.T., M.T.',
    defaultIdNumber: 'NIP. 197508212001122001',
  },
  {
    title: 'Dekan Fakultas',
    defaultName: 'Prof. Dr. Ahmad Fauzi, M.Kom.',
    defaultIdNumber: 'NIP. 197111031998021001',
  },
  {
    title: 'Ketua Umum Himpunan / BEM',
    defaultName: 'Naufal Ramadhan',
    defaultIdNumber: 'NIM. 18222041',
  },
  {
    title: 'Ketua Dewan Juri',
    defaultName: 'Dr. Budi Santoso, S.Kom., M.T.',
    defaultIdNumber: 'NIDN. 0415068201',
  },
]

export function createDefaultSignatoriesForCategory(
  category: CertificateCategory
): SignatorySlot[] {
  if (category === 'winner') {
    return [
      {
        id: 'sig-1',
        name: 'Prof. Dr. Ir. Hendra Wijaya, M.Sc.',
        title: 'Rektor Universitas',
        idNumber: 'NIP. 196804121994031002',
      },
      {
        id: 'sig-2',
        name: 'Dr. Budi Santoso, S.Kom., M.T.',
        title: 'Ketua Dewan Juri',
        idNumber: 'NIDN. 0415068201',
      },
      {
        id: 'sig-3',
        name: 'M. Rizky Pratama',
        title: 'Ketua Pelaksana',
        idNumber: 'NIM. 13522089',
      },
    ]
  }

  if (category === 'group') {
    return [
      {
        id: 'sig-1',
        name: 'Dr. Eng. Ratna Kusuma, S.T., M.T.',
        title: 'Wakil Rektor Kemahasiswaan',
        idNumber: 'NIP. 197508212001122001',
      },
      {
        id: 'sig-2',
        name: 'M. Rizky Pratama',
        title: 'Ketua Pelaksana',
        idNumber: 'NIM. 13522089',
      },
    ]
  }

  return [
    {
      id: 'sig-1',
      name: 'Naufal Ramadhan',
      title: 'Ketua Umum Himpunan',
      idNumber: 'NIM. 18222041',
    },
    {
      id: 'sig-2',
      name: 'M. Rizky Pratama',
      title: 'Ketua Pelaksana',
      idNumber: 'NIM. 13522089',
    },
  ]
}

export function getPresetTemplateByCategory(
  category: CertificateCategory
): CertificateTemplateDesign {
  switch (category) {
    case 'winner':
      return {
        colors: { ...COLOR_PALETTES[1].colors }, // Gold Prestige
        borderStyle: 'ornate',
        borderWidth: 3,
        orientation: 'landscape',
        logoUrl: SAMPLE_TROPHY_CREST_BASE64,
        embedLogoInQr: true,
        badgeText: 'PIAGAM PENGHARGAAN KOMPETISI',
        title: 'SERTIFIKAT KEJUARAAN',
        subtitle: 'Diberikan dengan penuh kebanggaan kepada:',
        description:
          'Atas prestasi gemilang meraih predikat {{peringkat}} sebagai {{peran}} dalam kompetisi "{{event}}" yang diselenggarakan pada tanggal {{tanggal}}.',
        showStudentId: true,
        showGroupMembers: true,
        signatories: createDefaultSignatoriesForCategory('winner'),
      }

    case 'group':
      return {
        colors: { ...COLOR_PALETTES[4].colors }, // Royal Magenta
        borderStyle: 'double',
        borderWidth: 3,
        orientation: 'landscape',
        logoUrl: SAMPLE_CONVENA_LOGO_BASE64,
        embedLogoInQr: true,
        badgeText: 'SERTIFIKAT DELEGASI & TIM',
        title: 'PIAGAM APRESIASI KELOMPOK',
        subtitle: 'Diberikan kepada Tim / Kelompok:',
        description:
          'Atas kolaborasi, inovasi, dan kontribusi tim {{tim}} ({{peringkat}}) dalam rangkaian kegiatan "{{event}}" pada tanggal {{tanggal}}.',
        showStudentId: false,
        showGroupMembers: true,
        signatories: createDefaultSignatoriesForCategory('group'),
      }

    case 'speaker':
      return {
        colors: { ...COLOR_PALETTES[2].colors }, // Ivory Academic
        borderStyle: 'double',
        borderWidth: 2,
        orientation: 'landscape',
        logoUrl: SAMPLE_CAMPUS_CREST_BASE64,
        embedLogoInQr: true,
        badgeText: 'PIAGAM KEHORMATAN AKADEMIK',
        title: 'SERTIFIKAT NARASUMBER',
        subtitle: 'Disampaikan dengan hormat kepada:',
        description:
          'Sebagai {{peran}} yang telah membagikan wawasan, keahlian, dan inspirasi dalam kegiatan "{{event}}" yang diselenggarakan pada tanggal {{tanggal}}.',
        showStudentId: false,
        showGroupMembers: false,
        signatories: createDefaultSignatoriesForCategory('speaker'),
      }

    case 'committee':
      return {
        colors: { ...COLOR_PALETTES[5].colors }, // Emerald Campus
        borderStyle: 'rounded',
        borderWidth: 2,
        orientation: 'landscape',
        logoUrl: SAMPLE_CONVENA_LOGO_BASE64,
        embedLogoInQr: true,
        badgeText: 'SERTIFIKAT DEDIKASI KEPANITIAAN',
        title: 'SERTIFIKAT PANITIA PELAKSANA',
        subtitle: 'Diberikan sebagai bentuk apresiasi kepada:',
        description:
          'Atas dedikasi, integritas, dan kerja kerasnya sebagai {{peran}} dalam menyukseskan penyelenggaraan "{{event}}" pada {{tanggal}}.',
        showStudentId: true,
        showGroupMembers: false,
        signatories: createDefaultSignatoriesForCategory('committee'),
      }

    case 'custom':
      return {
        colors: { ...COLOR_PALETTES[3].colors }, // Cyber Blue
        borderStyle: 'flat',
        borderWidth: 2,
        orientation: 'landscape',
        logoUrl: SAMPLE_CONVENA_LOGO_BASE64,
        embedLogoInQr: true,
        badgeText: 'DOKUMEN SERTIFIKASI RESMI',
        title: 'SERTIFIKAT PENGHARGAAN',
        subtitle: 'Diberikan kepada:',
        description:
          'Atas kontribusi dan pencapaiannya sebagai {{peran}} {{peringkat}} pada agenda "{{event}}" yang dilaksanakan pada tanggal {{tanggal}}.',
        showStudentId: true,
        showGroupMembers: true,
        signatories: createDefaultSignatoriesForCategory('custom'),
      }

    case 'attendance':
    default:
      return {
        colors: { ...COLOR_PALETTES[0].colors }, // Convena Neon
        borderStyle: 'rounded',
        borderWidth: 2,
        orientation: 'landscape',
        logoUrl: SAMPLE_CONVENA_LOGO_BASE64,
        embedLogoInQr: true,
        badgeText: 'SERTIFIKAT PARTISIPASI RESMI',
        title: 'SERTIFIKAT PENGHARGAAN',
        subtitle: 'Diberikan dengan bangga kepada:',
        description:
          'Atas partisipasi dan kontribusi aktifnya sebagai {{peran}} dalam kegiatan "{{event}}" yang diselenggarakan pada tanggal {{tanggal}}.',
        showStudentId: true,
        showGroupMembers: false,
        signatories: createDefaultSignatoriesForCategory('attendance'),
      }
  }
}
