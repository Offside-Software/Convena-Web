# Convena Final Project Plan

## 1. Product direction

Convena should be positioned as a comprehensive event management platform for
Indonesian student organizations, not only as an event-ticketing platform.

### MVP scope

- Organization, member, role, and division management
- Event creation with draft/published and public/private states
- Registration and attendee management
- Real payment-gateway integration
- Committee task management
- Proposal and LPJ generation
- Budget, expense, and SPJ tracking
- Sponsorship CRM and sponsor analytics
- QR attendance/check-in
- E-certificates and public certificate verification
- A focused AI sponsorship/proposal assistant using an external LLM
- Event location GPS

### Post-MVP scope

Do not implement these in the final MVP unless the core system is complete:

- AI attendee matchmaking
- Event chatbot
- Gamification
- Community mode
- Hybrid streaming
- Event success prediction
- Vendor marketplace
- Blockchain certificate hashing
- Advanced sentiment analysis

The differentiators can be presented as future roadmap items after the
student-organization is stable.

## 2. Phase breakdown

### Phase 0 — Alignment, scope, and risk validation

- Confirm user roles: organization admin, committee member, treasurer, sponsor,
  attendee, and certificate verifier.
- Write the main user journeys and acceptance criteria.
- Define out-of-scope features and success metrics.
- Select the Indonesian payment provider and external LLM provider.
- Confirm sandbox access, API limits, pricing, webhook behavior, data
  processing, consent, and fallback behavior.
- Define the shared API contract, error format, authorization matrix, naming
  conventions, branching strategy, and definition of done.
- Prepare seed data for an organization, event, sponsor, attendee, and finances.

### Phase 1 — Architecture and development foundation

#### Web — `Convena-Web`

- Replace the static HTML/CSS prototype with React TypeScript and Tailwind CSS.
- Create layout, navigation, authentication, forms, tables, dashboard, loading,
  empty, success, and error-state components.
- Add linting, formatting, type checking, tests, and CI.

#### API — `Convena-API`

- Bootstrap Rust with Axum.
- Choose the database and migration strategy.
- Define entities, relationships, API versioning, pagination, filtering, and
  UTC/date handling.
- Implement authentication, refresh/session handling, RBAC, request validation,
  structured errors, logging, and audit events.
- Document the API using OpenAPI or an equivalent contract.

#### Mobile — `Convena-App`

- Bootstrap Flutter navigation and screen structure.
- Implement the API client and secure token storage.
- Add permission handling for camera/scanning.
- Add tests and CI for supported mobile targets.

#### Environments

- Create local, staging, and production configurations.
- Keep secrets in environment/secret management, never in source control.
- Confirm the hosting arrangement for the Rust API and database alongside the
  Vercel web deployment.

### Phase 2 — Organization, event, registration, and payment core

- Organization creation, member invitations, roles, and divisions.
- Event CRUD with title, description, capacity, schedule, venue, online link,
  visibility, and organizer permissions.
- Draft/published event states.
- Public event discovery and event-detail pages.
- Organizer event dashboard.
- Registration form configuration.
- Attendee registration, duplicate prevention, confirmation status, and
  organizer attendee list.
- Payment checkout, verified webhooks, idempotency, payment states,
  cancellation/refund policy, and reconciliation view.
- Web attendee registration and payment experience.
- Mobile event details, registration status, and attendee ticket/QR display.
- Integration tests for payment and registration state transitions.

### Phase 3 — Committee operations and financial control

- Committee/division membership.
- Task assignment, status, priority, deadlines, comments, and progress.
- Proposal sections, reusable templates, versioning, and approval status.
- Budget categories and planned amounts.
- Expense records, receipt uploads, approval status, and audit history.
- Event profit/loss and budget-variance summaries.
- SPJ/LPJ report assembly and export/download.
- Dashboards for overdue tasks, pending approvals, budget variance, and event
  readiness.
- Tests for calculations, authorization, audit history, and report consistency.

### Phase 4 — Sponsorship CRM and AI assistant

- Sponsor/company records and contacts.
- Sponsorship pipeline stages, notes, follow-up reminders, commitments, and
  proposal status.
- Sponsorship packages and event benefits.
- Sponsor analytics for commitments, payment status, package value, and
  follow-up/lead activity.
- AI assistant input form for event and sponsorship context.
- Prompt version tracking, generated draft review, edit, regenerate, and export.
- Provider timeout/retry limits, rate limits, usage/cost logging, and sensitive
  data redaction.
- Human-review warning: AI output must not silently submit official proposals or
  invent dates, prices, sponsors, or commitments.
- Deterministic template fallback when the LLM is unavailable.
- Evaluate generated drafts for relevance, factuality, Indonesian language
  quality, and invented information.

### Phase 5 — QR attendance and certificates

- Generate registration and attendance QR codes.
- Use signed, expiring or replay-resistant QR tokens.
- Organizer check-in with camera permission handling.
- Duplicate-scan behavior, invalid-scan feedback, and manual override with audit
  trail.
- Attendee ticket and attendance-status views on web and mobile.
- Certificate eligibility rules and organizer approval.
- E-certificate templates, unique certificate IDs, and QR verification.
- Public certificate verification page.
- Certificate revocation and verification status.
- Test repeated scans, authorization boundaries, invalid codes, and verification.

### Phase 6 — Integration, quality, and release hardening

- Run end-to-end journeys across web, API, mobile, payment webhooks, AI
  fallback, check-in, reports, and certificates.
- Test responsive layouts and accessibility for primary web journeys.
- Test mobile devices, camera permissions, network failures, and token expiry.
- Review authentication, authorization, webhook signatures, file uploads, rate
  limiting, secrets, personal-data exposure, and prompt/data leakage.
- Run load checks for registration, dashboard queries, QR scans, and webhook
  retries.
- Add request IDs, structured logs, provider-failure visibility, and payment
  reconciliation alerts.
- Freeze the API contract and remove demo-only shortcuts.
- Prepare clean presentation data and rollback/runbook steps.

### Phase 7 — Deployment and final presentation

- Deploy the React frontend to Vercel.
- Deploy the Rust/Axum API and database using a compatible hosting arrangement.
- Configure production domains, environment variables, payment webhooks, and
  LLM credentials.
- Publish a Flutter test build and installation instructions.
- Run a final smoke test from both a clean attendee account and seeded
  organizer account.
- Prepare architecture diagram, ERD, API documentation, test evidence, threat
  and risk summary, user manual, and individual contribution log.
- Rehearse this end-to-end demo:

  `create organization → create event → generate proposal → manage sponsor and
  budget → accept registration/payment → scan attendee → issue and verify
  certificate → generate LPJ`

## 3. Five-person team organization

Use feature squads rather than permanently separating people by technology.
Every squad must coordinate API, web, and mobile impact.

1. **Product and integration owner**
   - Backlog, acceptance criteria, API contract, release coordination, QA
     evidence, documentation, and presentation.
2. **Event and registration squad**
   - Organization/event lifecycle, public pages, registration, payment, and
     attendee ticket.
3. **Organization and operations squad**
   - Members, divisions, tasks, proposal, LPJ, budget, expenses, and SPJ.
4. **Sponsorship and AI squad**
   - Sponsor CRM, sponsor analytics, LLM integration, prompt evaluation, and
     fallback behavior.
5. **Attendance, mobile, and release squad**
   - QR check-in, certificates, Flutter experience, device testing, CI/CD, and
     observability.

Rotate ownership by phase so every person contributes to at least one web, API,
and mobile integration or review. A feature is complete only when its API
contract, main UI, mobile impact decision, tests, permission rules, and demo
data are complete.

## 4. Important risks and decisions

- Real payment and LLM integrations are the largest risks. Resolve provider
  access, sandbox testing, cost, limits, security, and fallback behavior in
  Phase 0.
- Use a human-review workflow for every AI-generated official document.
- Protect attendee personal data, financial records, receipts, generated
  documents, payment events, and sponsor data with explicit authorization and
  retention rules.
- Treat payment webhooks as untrusted input: verify signatures and make handlers
  idempotent.
- Do not let a failed LLM call block manual proposal creation.
- Vercel is the web deployment target; document the separate API/database
  hosting arrangement if Rust/Axum cannot run in the chosen Vercel setup.
- The existing repository is a static prototype, so migrate to React/Tailwind
  deliberately rather than trying to preserve the old page structure as the
  production architecture.
