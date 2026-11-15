# Convena-Web

Convena-Web adalah aplikasi web manajemen kegiatan dan operasional organisasi kemahasiswaan (Ormawa, BEM, Himpunan Mahasiswa, dan Unit Kegiatan Mahasiswa) di Indonesia. Platform ini mengintegrasikan siklus penuh penyelenggaraan acara kampus mulai dari pengelolaan organisasi berbasis peran (Role-Based Access Control), publikasi acara, registrasi peserta, presensi kehadiran berbasis kode QR secara waktu nyata (real-time), manajemen tugas kepanitiaan, pengelolaan pipeline sponsorship berbantuan kecerdasan buatan (AI), pencatatan anggaran Rencana Anggaran Biaya (RAB) dan Surat Pertanggungjawaban (SPJ), hingga studio desain serta penerbitan dan verifikasi e-sertifikat resmi.

---

## Daftar Isi

1. [Gambaran Umum dan Tujuan Proyek](#gambaran-umum-dan-tujuan-proyek)
2. [Fitur Utama](#fitur-utama)
3. [Teknologi yang Digunakan](#teknologi-yang-digunakan)
4. [Arsitektur Sistem dan Alur Kerja](#arsitektur-sistem-dan-alur-kerja)
5. [Struktur Basis Data (ERD)](#struktur-basis-data-erd)
6. [Sistem Hak Akses dan Peran (RBAC)](#sistem-hak-akses-dan-peran-rbac)
7. [Panduan Instalasi dan Persiapan Lingkungan](#panduan-instalasi-dan-persiapan-lingkungan)
8. [Daftar Rute Aplikasi](#daftar-rute-aplikasi)
9. [Spesifikasi Endpoint API Utama](#spesifikasi-endpoint-api-utama)

---

## Gambaran Umum dan Tujuan Proyek

Penyelenggaraan kegiatan kemahasiswaan umumnya menggunakan berbagai perangkat terpisah untuk pendaftaran peserta, koordinasi panitia, pelacakan sponsor, rekapitulasi nota pengeluaran (SPJ), serta pembuatan sertifikat. Pemisahan ini sering menyebabkan duplikasi data, keterlambatan penyusunan Laporan Pertanggungjawaban (LPJ), serta sulitnya memvalidasi keaslian sertifikat kepanitiaan maupun peserta.

Convena hadir sebagai satu ruang kerja terpadu (single workspace) yang menghubungkan seluruh kebutuhan operasional tersebut ke dalam basis data yang terstruktur, transparan, dan dapat diaudit oleh pengurus organisasi maupun pihak kampus.

---

## Fitur Utama

### 1. Manajemen Organisasi dan Hak Akses (RBAC)
- Pembuatan dan pengelolaan profil organisasi kemahasiswaan beserta identitas universitas atau institusi.
- Pengelolaan peran kustom (Role) dengan matriks izin granular untuk modul organisasi, acara, tugas, sponsorship, keuangan, dan sertifikasi.
- Undang anggota baru melalui alamat surel atau nama pengguna serta penugasan jabatan kustom (custom title) dan divisi.

### 2. Manajemen Acara, Tiket, dan Peta Lokasi Interaktif
- Pembuatan acara dengan kategori Seminar, Workshop, Kompetisi, Festival, Konferensi, dan Gathering.
- Dukungan mode pelaksanaan luring (offline), daring (online), maupun hibrida (hybrid) lengkap dengan pemilih titik koordinat GPS interaktif berbasis Leaflet dan OpenStreetMap.
- Pengaturan kuota dan tingkatan tiket (Ticket Tiers) gratis maupun berbayar.
- Halaman eksplorasi publik dengan filter kategori, kampus, status acara, dan pencarian kata kunci.

### 3. Presensi Kehadiran QR Real-Time
- Pembuatan token QR kehadiran unik untuk setiap acara.
- Pemindaian tiket peserta dan sinkronisasi status kehadiran (`checked_in`) secara langsung melalui Server-Sent Events (SSE), BroadcastChannel, dan pemutakhiran otomatis.

### 4. Manajemen Tugas Kepanitiaan (Task Management)
- Pendistribusian tugas per divisi kepanitiaan lengkap dengan tenggat waktu, penanggung jawab (PIC), dan pelacakan status (`todo`, `in_progress`, `completed`).

### 5. Pipeline Sponsorship dan Asisten Draf Proposal AI
- Pelacakan prospek sponsor melalui tahapan pipeline (`prospect`, `contacted`, `proposal_sent`, `negotiating`, `committed`, `paid`, `rejected`).
- Pengelolaan kuota paket sponsor (Platinum, Gold, Silver) dan daftar kewajiban kontraprestasi (deliverables).
- Generator draf surat penawaran kerja sama sponsorship otomatis menggunakan integrasi layanan AI dengan opsi gaya bahasa formal maupun hangat.

### 6. Manajemen Anggaran (RAB) dan Verifikasi Kuitansi SPJ
- Pemantauan pagu anggaran terencana terhadap realisasi pengeluaran aktual pada setiap kategori biaya (`equipment`, `catering`, `venue`, `marketing`, `speaker_honor`, `logistics`, `other`).
- Pencatatan nota pengeluaran oleh panitia beserta alur persetujuan dan audit verifikasi SPJ oleh bendahara atau pengurus inti (`draft`, `submitted`, `verified`, `rejected`).

### 7. Studio Desain, Penerbitan, dan Verifikasi E-Sertifikat
- Setiap template dan sertifikat yang diterbitkan terikat secara spesifik pada satu acara (`eventId`).
- Kustomisasi visual template secara langsung (live preview) meliputi skema warna, tipe bingkai (`rounded`, `flat`, `double`, `ornate`, `minimal`, `none`), ketebalan garis, orientasi kertas (`landscape` dan `portrait`), serta variabel narasi dinamis (`{{nama}}`, `{{event}}`, `{{peran}}`, `{{peringkat}}`, `{{tim}}`, `{{anggota}}`, `{{instansi}}`, `{{tanggal}}`, `{{nomor}}`).
- Penyematan logo institusi (mendukung format Base64) pada tajuk sertifikat sekaligus di bagian tengah Kode QR Validasi Utama dengan tingkat koreksi kesalahan tinggi (`level="H"`).
- Pengaturan jumlah dan jabatan penandatangan secara dinamis (Ketua Pelaksana, Rektor, Wakil Rektor, Dekan, Ketua Dewan Juri, Ketua Himpunan, dan lainnya) di mana seluruh tanda tangan dirender sebagai Kode QR digital murni tanpa gambar tanda tangan basah di dalamnya.
- Dukungan variasi sertifikat untuk pemenang kompetisi (`winner`), peserta (`attendance`), kelompok atau tim beserta daftar anggota (`group`), pembicara (`speaker`), dan panitia (`committee`).
- Ekspor cetak dan penyimpanan dokumen PDF berkualitas vektor serta halaman verifikasi publik berdasarkan nomor sertifikat atau pemindaian QR.

---

## Teknologi yang Digunakan

| Kategori | Teknologi | Versi / Keterangan |
| :--- | :--- | :--- |
| Pustaka Antarmuka | React | 19.3.x |
| Bahasa Pemrograman | TypeScript | 6.0.x |
| Build Tool & Bundler | Vite | 8.3.x (dengan React Compiler) |
| Framework Styling | Tailwind CSS | 4.3.x (`@tailwindcss/vite`) |
| Routing | React Router DOM | 7.18.x |
| Peta & Geospasial | Leaflet | 1.9.x |
| Generator Kode QR | `qrcode.react` & `react-qr-code` | Render SVG dan Canvas dengan tingkat koreksi kesalahan |
| Ikonografi | Lucide React | 1.61.x |
| Linter | Oxlint | 1.88.x |

---

## Arsitektur Sistem dan Alur Kerja

Aplikasi web Convena-Web berkomunikasi dengan layanan backend Convena REST API melalui klien HTTP terpusat yang menangani otorisasi token Bearer JWT, serialisasi JSON, serta aliran data kehadiran waktu nyata.

```mermaid
flowchart LR
    subgraph Client["Aplikasi Klien (Convena-Web)"]
        PublicUI["Halaman Publik\n(Eksplorasi Acara & Verifikasi Sertifikat)"]
        WorkspaceUI["Dashboard Workspace\n(Organisasi, Acara, Tugas, Sponsor, RAB/SPJ, Sertifikat)"]
        ServiceLayer["Lapisan Layanan & Klien HTTP\n(Auth, Events, Org, Finance, Sponsor, Certificate)"]
    end

    subgraph Backend["Layanan Backend (Convena-API)"]
        RestAPI["REST API Endpoints\n(Otentikasi JWT & Middleware RBAC)"]
        SSEStream["Event Stream (SSE)\n(Presensi Real-Time)"]
        AIService["Layanan Asisten AI\n(Generator Surat Sponsorship)"]
    end

    subgraph Storage["Penyimpanan Data"]
        Database[("Basis Data Relasional")]
    end

    PublicUI --> ServiceLayer
    WorkspaceUI --> ServiceLayer
    ServiceLayer -- "HTTPS JSON (Bearer Token)" --> RestAPI
    SSEStream -- "Server-Sent Events" --> ServiceLayer
    RestAPI --> AIService
    RestAPI --> Database
```

### Alur Operasional End-to-End Penyelenggaraan Acara

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Pengurus / Panitia
    actor Peserta as Peserta Kegiatan
    actor Publik as Verifikator Publik
    participant Web as Convena-Web
    participant API as Convena-API

    Admin->>Web: Buat Organisasi, Peran RBAC, dan Acara Baru
    Web->>API: POST /organizations & POST /events
    Admin->>Web: Kelola Paket Sponsor, Tugas Panitia, dan Pagu RAB
    Web->>API: Simpan konfigurasi operasional acara
    Peserta->>Web: Pilih Tingkatan Tiket & Registrasi Acara
    Web->>API: POST /events/:id/register
    API-->>Peserta: Terbitkan Kode Tiket & QR Kehadiran
    Peserta->>Web: Presensi Kehadiran di Lokasi Acara
    Web->>API: POST /events/:id/registrations/:regId/check-in
    API-->>Web: Siarkan status kehadiran real-time (SSE)
    Admin->>Web: Desain Template Sertifikat & Atur Penandatangan QR
    Web->>API: POST /events/:id/certificate-templates
    Admin->>Web: Terbitkan Sertifikat (Peserta, Pemenang, Kelompok)
    Web->>API: POST /events/:id/certificates
    Publik->>Web: Pindai QR Sertifikat / Masukkan Nomor Sertifikat
    Web->>API: GET /certificates/verify/:code
    API-->>Publik: Tampilkan Sertifikat Terverifikasi & Tanda Tangan QR
```

---

## Struktur Basis Data (ERD)

Diagram berikut merepresentasikan struktur entitas dan relasi data utama yang digunakan oleh ekosistem Convena:

```mermaid
erDiagram
    USERS ||--o{ ORGANIZATION_MEMBERS : "tergabung dalam"
    USERS ||--o{ EVENT_MEMBERS : "ditugaskan pada"
    USERS ||--o{ EVENT_REGISTRATIONS : "mendaftar"
    ORGANIZATIONS ||--o{ ORGANIZATION_ROLES : "memiliki"
    ORGANIZATIONS ||--o{ ORGANIZATION_MEMBERS : "memiliki anggota"
    ORGANIZATIONS ||--o{ EVENTS : "menyelenggarakan"
    ORGANIZATION_ROLES ||--o{ ORGANIZATION_MEMBERS : "diberikan ke"

    EVENTS ||--o{ EVENT_MEMBERS : "memiliki panitia"
    EVENTS ||--o{ TICKET_TIERS : "menyediakan"
    EVENTS ||--o{ EVENT_REGISTRATIONS : "menerima"
    EVENTS ||--o{ COMMITTEE_TASKS : "memiliki tugas"
    EVENTS ||--o{ SPONSOR_PACKAGES : "menawarkan"
    EVENTS ||--o{ SPONSOR_LEADS : "mengelola prospek"
    EVENTS ||--|| EVENT_BUDGETS : "memiliki anggaran"
    EVENTS ||--o{ EXPENSE_RECORDS : "mencatat pengeluaran"
    EVENTS ||--o{ CERTIFICATE_TEMPLATES : "memiliki template"
    EVENTS ||--o{ CERTIFICATES : "menerbitkan"

    TICKET_TIERS ||--o{ EVENT_REGISTRATIONS : "dipilih pada"
    EVENT_BUDGETS ||--o{ BUDGET_CATEGORY_PLANS : "dirinci per kategori"
    CERTIFICATE_TEMPLATES ||--o{ CERTIFICATES : "digunakan oleh"
    CERTIFICATES ||--o{ CERTIFICATE_SIGNATORIES : "ditandatangani oleh"

    USERS {
        string id PK
        string name
        string username UK
        string email UK
        string password_hash
        string role
        string company
        string student_id
        string avatar_url
        datetime created_at
        datetime updated_at
    }

    ORGANIZATIONS {
        string id PK
        string name
        string slug UK
        string company
        string description
        string logo_url
        string banner_url
        string created_by FK
        datetime created_at
        datetime updated_at
    }

    ORGANIZATION_ROLES {
        string id PK
        string organization_id FK
        string name
        string display_name
        string description
        boolean is_system
        json permissions
        datetime created_at
        datetime updated_at
    }

    ORGANIZATION_MEMBERS {
        string id PK
        string organization_id FK
        string user_id FK
        string role_id FK
        string custom_title
        string status
        datetime joined_at
        datetime updated_at
    }

    EVENTS {
        string id PK
        string organization_id FK
        string created_by FK
        string title
        string slug UK
        string description
        string short_description
        string banner_url
        string category
        string status
        string visibility
        datetime start_date
        datetime end_date
        string location_type
        string venue_name
        string address
        string city
        string online_url
        float latitude
        float longitude
        string attendance_qr_token
        string organization_name
        string company
        datetime created_at
        datetime updated_at
    }

    EVENT_MEMBERS {
        string id PK
        string event_id FK
        string user_id FK
        string role
        string custom_title
        string division
        string status
        datetime joined_at
    }

    TICKET_TIERS {
        string id PK
        string event_id FK
        string name
        decimal price
        int quota
        int sold
        json benefits
        boolean is_available
    }

    EVENT_REGISTRATIONS {
        string id PK
        string event_id FK
        string user_id FK
        string tier_id FK
        string tier_name
        decimal price
        string payment_method
        string payment_status
        string status
        string attendee_name
        string attendee_email
        string attendee_phone
        string attendee_institution
        string ticket_code UK
        datetime checked_in_at
        datetime created_at
    }

    COMMITTEE_TASKS {
        string id PK
        string event_id FK
        string assignee_id FK
        string assignee
        string division
        string title
        string description
        date due_date
        string status
        datetime created_at
        datetime updated_at
    }

    SPONSOR_PACKAGES {
        string id PK
        string event_id FK
        string name
        decimal price
        int slot_limit
        int slots_filled
        json deliverables
        string color
    }

    SPONSOR_LEADS {
        string id PK
        string event_id FK
        string company_name
        string contact_person
        string email
        string phone
        string stage
        string package_interest
        decimal value
        date last_contact_date
        string notes
        string assigned_committee
    }

    EVENT_BUDGETS {
        string id PK
        string event_id FK
        decimal total_budget_planned
        decimal total_income_realized
        decimal total_expense_realized
        decimal remaining_budget
        int pending_spj_count
    }

    BUDGET_CATEGORY_PLANS {
        string id PK
        string event_id FK
        string category
        string label
        decimal planned_amount
        decimal spent_amount
    }

    EXPENSE_RECORDS {
        string id PK
        string event_id FK
        string submitted_by_id FK
        string approved_by_id FK
        string title
        string category
        decimal amount
        string receipt_url
        date receipt_date
        string submitted_by
        string division
        string spj_status
        string notes
        datetime created_at
        datetime updated_at
    }

    CERTIFICATE_TEMPLATES {
        string id PK
        string event_id FK
        string name
        string category
        json colors
        string border_style
        int border_width
        string orientation
        text logo_url
        boolean embed_logo_in_qr
        string badge_text
        string title
        string subtitle
        text description
        boolean show_student_id
        boolean show_group_members
        json signatories
        datetime updated_at
    }

    CERTIFICATES {
        string id PK
        string event_id FK
        string template_id FK
        string certificate_number UK
        string recipient_name
        string recipient_email
        string student_id
        string company
        string event_title
        string organization_name
        string issue_date
        string role
        string category
        string recipient_type
        string group_name
        json group_members
        string rank
        string role_label
        boolean verified
        text qr_code_url
        json template_snapshot
    }

    CERTIFICATE_SIGNATORIES {
        string id PK
        string certificate_id FK
        string name
        string title
        string id_number
        text signature_qr_value
        int sort_order
    }
```

---

## Sistem Hak Akses dan Peran (RBAC)

Convena menerapkan pengendalian akses dua tingkat, yaitu tingkat organisasi (`OrgRole`) dan tingkat kepanitiaan acara (`EventRole`).

| Hak Akses / Kemampuan | Owner | Admin | Treasurer (Bendahara) | Committee (Panitia) | Sponsor | Attendee (Peserta) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Mengelola Pengaturan & Menghapus Acara | Ya | Sebagian | Tidak | Tidak | Tidak | Tidak |
| Mengelola Anggota Tim & Peran | Ya | Ya | Tidak | Tidak | Tidak | Tidak |
| Memindai QR Kehadiran Peserta | Ya | Ya | Tidak | Ya | Tidak | Tidak |
| Melihat Rencana Anggaran (RAB) | Ya | Ya | Ya | Ya | Tidak | Tidak |
| Mengajukan Kuitansi Pengeluaran (SPJ) | Ya | Ya | Ya | Ya | Tidak | Tidak |
| Memverifikasi & Menyetujui Audit SPJ | Ya | Ya | Ya | Tidak | Tidak | Tidak |
| Mengelola Pipeline Sponsorship | Ya | Ya | Tidak | Ya | Tidak | Tidak |
| Melihat Kontraprestasi Sponsor | Ya | Ya | Tidak | Ya | Ya | Tidak |
| Mendesain & Menerbitkan E-Sertifikat | Ya | Ya | Tidak | Ya | Tidak | Tidak |
| Memverifikasi Keaslian Sertifikat | Ya | Ya | Ya | Ya | Ya | Ya |

---

## Panduan Instalasi dan Persiapan Lingkungan

### Prasyarat Sistem
- **Node.js**: Versi 20.x atau lebih baru (direkomendasikan versi LTS terbaru).
- **Package Manager**: `npm` (bawaan Node.js).
- **Layanan Backend**: Server Convena-API yang berjalan pada lingkungan lokal atau server produksi.

### Langkah Instalasi

1. **Kloning Repositori**
   ```bash
   git clone <url-repositori-convena-web>
   cd Convena-Web
   ```

2. **Instalasi Dependensi**
   ```bash
   npm install
   ```

3. **Konfigurasi Variabel Lingkungan (Environment Variables)**
   Buat berkas `.env` pada direktori utama proyek apabila ingin mengarahkan aplikasi ke URL backend tertentu:
   ```env
   VITE_API_URL=http://localhost:8000
   ```
   Apabila variabel `VITE_API_URL` tidak diatur, aplikasi secara otomatis menggunakan:
   - Mode Pengembangan (`npm run dev`): `http://localhost:8000`
   - Mode Produksi (`npm run build`): `https://env-opentask.user.cloudjkt02.com/api/convena`

4. **Menjalankan Server Pengembangan**
   ```bash
   npm run dev
   ```
   Aplikasi dapat diakses melalui peramban pada alamat `http://localhost:5173`.

### Daftar Perintah Skrip

| Perintah | Deskripsi |
| :--- | :--- |
| `npm run dev` | Menjalankan server pengembangan Vite dengan fitur Hot Module Replacement (HMR). |
| `npm run lint` | Menjalankan pemeriksaan kualitas kode statis menggunakan Oxlint. |
| `npm run build` | Melakukan pemeriksaan tipe TypeScript (`tsc -b`) dan membangun bundel produksi ke direktori `dist`. |
| `npm run preview` | Menjalankan pratinjau hasil kompilasi produksi secara lokal. |

---

## Daftar Rute Aplikasi

### Rute Publik (`MainLayout`)
- `/` : Halaman beranda utama Convena.
- `/events` : Katalog eksplorasi dan pencarian acara mahasiswa.
- `/events/:id` : Halaman detail informasi acara, peta lokasi, dan pendaftaran tiket.
- `/verify` : Halaman publik pemeriksaan dan validasi keaslian e-sertifikat.
- `/verify/:code` : Halaman verifikasi langsung berdasarkan nomor sertifikat atau tautan pindaian kode QR.
- `/login` : Halaman masuk pengguna.
- `/register` : Halaman pendaftaran akun baru.

### Rute Ruang Kerja Pengurus (`DashboardLayout`)
- `/dashboard` : Ringkasan metrik utama dan ikhtisar ruang kerja.
- `/dashboard/organization` : Manajemen profil organisasi, peran RBAC, izin akses, dan daftar anggota.
- `/dashboard/events` : Daftar acara yang dikelola, pemindaian QR kehadiran, dan daftar pendaftar.
- `/dashboard/events/create` : Formulir pembuatan acara baru.
- `/dashboard/events/:id/edit` : Formulir penyuntingan data acara.
- `/dashboard/tasks` : Papan manajemen tugas divisi kepanitiaan.
- `/dashboard/sponsorship` : Manajemen prospek sponsor, paket sponsorship, dan asisten draf email AI.
- `/dashboard/finances` : Pengelolaan pagu anggaran RAB, pelacakan varians biaya, dan tabel verifikasi kuitansi SPJ.
- `/dashboard/certificate` : Studio desain template e-sertifikat, pengaturan tanda tangan QR, variasi penerima, dan penerbitan sertifikat.
- `/dashboard/verify` : Halaman validasi sertifikat di dalam ruang kerja internal.

---

## Spesifikasi Endpoint API Utama

Berikut adalah ringkasan endpoint REST API yang digunakan oleh layanan frontend Convena-Web:

### Otentikasi dan Pengguna
- `POST /auth/login` : Otentikasi pengguna dengan email atau username dan kata sandi.
- `POST /auth/register` : Registrasi pengguna baru.
- `GET /auth/me` : Mengambil profil pengguna yang sedang masuk beserta sesi aktif.

### Organisasi dan RBAC
- `GET /organizations` : Mengambil daftar organisasi milik pengguna.
- `POST /organizations` : Membuat organisasi baru.
- `GET /organizations/:id/roles` : Mengambil daftar peran dan izin akses dalam organisasi.
- `POST /organizations/:id/roles` : Membuat peran kustom baru beserta daftar izin (`permissions`).
- `GET /organizations/:id/members` : Mengambil daftar anggota organisasi.
- `POST /organizations/:id/members` : Mengundang anggota baru ke dalam organisasi.

### Acara, Registrasi, dan Presensi
- `GET /events` : Mengambil daftar seluruh acara publik.
- `GET /events/my-events` : Mengambil daftar acara yang dikelola oleh pengguna.
- `POST /events` : Membuat acara baru.
- `PATCH /events/:id` : Memperbarui informasi acara.
- `POST /events/:id/register` : Mendaftarkan peserta pada tingkatan tiket tertentu.
- `GET /events/:id/registrations` : Mengambil daftar peserta terdaftar pada suatu acara.
- `POST /events/:id/attendance-qr` : Menghasilkan token QR presensi kehadiran acara.
- `POST /events/attend` : Memproses presensi kehadiran peserta menggunakan kode QR.
- `POST /events/:id/registrations/:regId/check-in` : Melakukan verifikasi kehadiran manual atau melalui pemindaian oleh panitia.
- `GET /events/:id/attendance-stream` : Kanal SSE untuk pemutakhiran data presensi secara waktu nyata.

### Tugas, Sponsorship, dan Keuangan
- `GET /events/:id/tasks` & `POST /events/:id/tasks` : Mengambil dan membuat tugas kepanitiaan.
- `GET /sponsorship/packages` & `GET /sponsorship/leads` : Mengambil paket dan prospek sponsor.
- `PATCH /sponsorship/leads/:id` : Memperbarui tahapan pipeline prospek sponsor.
- `POST /ai/generate-proposal-email` : Menghasilkan draf surat penawaran sponsorship dengan bantuan LLM.
- `GET /finances/summary/:eventId` : Mengambil ringkasan anggaran RAB dan realisasi pengeluaran acara.
- `PATCH /finances/summary/:eventId/category` : Memperbarui pagu anggaran per kategori pengeluaran.
- `GET /finances/expenses/:eventId` & `POST /finances/expenses/:eventId` : Mengambil dan mencatat kuitansi pengeluaran SPJ.
- `PATCH /finances/expenses/:eventId/:expenseId/verify` : Menyetujui atau menolak kuitansi SPJ.

### E-Sertifikat dan Verifikasi
- `GET /events/:eventId/certificate-templates` : Mengambil daftar template sertifikat untuk acara terkait.
- `POST /events/:eventId/certificate-templates` : Menyimpan template desain sertifikat baru pada acara.
- `PUT /events/:eventId/certificate-templates/:templateId` : Memperbarui template desain sertifikat.
- `GET /events/:eventId/certificates` : Mengambil daftar sertifikat yang telah diterbitkan pada acara.
- `POST /events/:eventId/certificates` : Menerbitkan sertifikat untuk daftar penerima (peserta, pemenang, kelompok, pembicara, atau panitia).
- `DELETE /events/:eventId/certificates/:certificateId` : Mencabut sertifikat yang telah diterbitkan.
- `GET /certificates/verify/:code` : Memverifikasi keaslian sertifikat berdasarkan kode nomor sertifikat.
