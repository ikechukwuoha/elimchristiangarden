import type { Metadata } from 'next'
import Layout from '@/components/Layout'
import FlyerBuilder from './FlyerBuilder'

export const metadata: Metadata = {
  title: 'Destiny Conference 2026 — Confirm Your Attendance',
  description:
    'Add your name and photo to create your personalized Destiny Conference 2026 attendance flyer. Download and share it as your confirmation.',
}

export default function WorshipEncounterPage() {
  return (
    <Layout>
      <FlyerBuilder />
    </Layout>
  )
}
