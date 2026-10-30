import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { MainLayout } from '../layouts/MainLayout.tsx'
import { DashboardLayout } from '../layouts/DashboardLayout.tsx'
import { HomePage } from '../pages/home/HomePage.tsx'
import { EventsPage } from '../pages/events/EventsPage.tsx'
import { EventDetailPage } from '../pages/events/EventDetailPage.tsx'
import { DashboardPage } from '../pages/dashboard/DashboardPage.tsx'
import { ManageEventsPage } from '../pages/dashboard/ManageEventsPage.tsx'
import { SponsorshipPage } from '../pages/sponsorship/SponsorshipPage.tsx'
import { FinancesPage } from '../pages/finances/FinancesPage.tsx'
import { VerifyPage } from '../pages/verify/VerifyPage.tsx'
import { LoginPage } from '../pages/auth/LoginPage.tsx'
import { RegisterPage } from '../pages/auth/RegisterPage.tsx'
import { NotFoundPage } from '../pages/not-found/NotFoundPage.tsx'

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages with MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/verify/:code" element={<VerifyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Admin Workspace with DashboardLayout */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/events" element={<ManageEventsPage />} />
        <Route path="/dashboard/sponsorship" element={<SponsorshipPage />} />
        <Route path="/dashboard/finances" element={<FinancesPage />} />
        <Route path="/dashboard/verify" element={<VerifyPage />} />
        <Route path="/dashboard/verify/:code" element={<VerifyPage />} />
      </Route>

      {/* Catch-all 404 Route */}
      <Route element={<MainLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
