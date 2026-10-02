import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import { cachedEvents } from '@/lib/events-cache'
import { upcomingEvents, type ChurchEvent } from '@/lib/events'

type LayoutProps = {
  children: React.ReactNode
}

export default async function Layout({ children }: LayoutProps) {
  // The ticker renders on every public page; failures fall back to the
  // Sunday invitation inside the ticker itself.
  let events: ChurchEvent[] = []
  try {
    events = upcomingEvents(await cachedEvents())
  } catch {
    events = []
  }
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar events={events} />
      <main id="main-content" className="flex-grow" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </div>
  )
}
