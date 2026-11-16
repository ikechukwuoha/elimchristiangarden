import type { Metadata } from 'next'
import Layout from '@/components/Layout'
import FlyerBuilder from './FlyerBuilder'

export const metadata: Metadata = {
  title: 'Worship Encounter — Confirm Your Attendance',
  description:
    'Add your name and photo to generate your personalized Worship Encounter attendance flyer. Download and share it as your confirmation.',
}

export default function WorshipEncounterPage() {
  return (
    <Layout>
      <FlyerBuilder />
    </Layout>
  )
}
