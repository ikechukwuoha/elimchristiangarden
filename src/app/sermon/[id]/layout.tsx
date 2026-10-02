import type { Metadata } from 'next'
import { cachedMessages } from '@/lib/message-cache'

export async function generateMetadata({ params }: LayoutProps<'/sermon/[id]'>): Promise<Metadata> {
  const { id } = await params
  let sermon
  try {
    sermon = (await cachedMessages()).find((item) => item.id === id)
  } catch {
    // The page's error boundary provides a retry when storage is unavailable.
    return { title: 'Message' }
  }

  if (!sermon) {
    return { title: 'Sermon not found' }
  }

  return {
    title: sermon.title,
    description: sermon.description ? sermon.description.substring(0, 160) : undefined,
  }
}

export default function SermonLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
