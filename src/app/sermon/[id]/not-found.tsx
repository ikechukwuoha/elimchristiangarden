import Link from 'next/link'
import { ArrowLeft, BookOpen } from 'lucide-react'
import Layout from '@/components/Layout'
import styles from '@/components/sermons/sermons.module.css'

export default function SermonNotFound() {
  return (
    <Layout>
      <div className={styles.sermons}>
        <div className={`${styles.container} ${styles.notFound}`}>
          <BookOpen size={44} strokeWidth={1.2} aria-hidden="true" />
          <span className={styles.eyebrow}>MESSAGE NOT FOUND</span>
          <h1>
            There’s more
            <br />
            <em>to discover.</em>
          </h1>
          <p>
            We couldn’t find that message. Explore the library to find a little
            encouragement for your day.
          </p>
          <Link href="/sermons" className={styles.greenButton}>
            <ArrowLeft size={17} aria-hidden="true" />
            Browse all messages
          </Link>
        </div>
      </div>
    </Layout>
  )
}
