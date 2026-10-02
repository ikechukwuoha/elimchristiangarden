import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sermons',
  description: 'Browse and listen to sermons from Elim Christian Garden International',
}

export default function SermonsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
