'use client'

import Link from 'next/link'
import styles from '@/components/sermons/sermons.module.css'

export default function MessageError({ reset }: { reset: () => void }) {
  return (
    <main className={styles.emptyState}>
      <h1>This message could not be loaded</h1>
      <p>Please try again in a moment.</p>
      <button type="button" onClick={reset} className={styles.greenButton}>Try again</button>
      <Link href="/sermons">Back to messages</Link>
    </main>
  )
}
