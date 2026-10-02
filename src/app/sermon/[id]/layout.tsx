import type { Metadata } from 'next'
import { cachedMessageLibrary } from '@/lib/message-cache'

export async function generateMetadata({ params }: LayoutProps<'/sermon/[id]'>): Promise<Metadata> {
  const { id } = await params
  if (!/^(audio-[a-f0-9]{32}|youtube-[\w-]{11})$/.test(id)) return { title: 'Message not found' }
  let sermon
  try {
    const { messages, unavailableSources } = await cachedMessageLibrary()
    sermon = messages.find((item) => item.id === id)
    if (!sermon && unavailableSources.includes(id.startsWith('audio-') ? 'audio' : 'youtube'))
      return { title: 'Message' }
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
