import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowDown,
  ArrowUpRight,
  AudioLines,
  Camera,
  ChevronRight,
  Clock3,
  Images,
  MapPin,
} from 'lucide-react'
import { unstable_cache } from 'next/cache'
import Layout from '@/components/Layout'
import { church } from '@/app/data/church'
import { cachedGroups } from '@/lib/community-cache'
import { groupDetails, groupOptions } from '@/lib/community'
import {
  deliveryUrl,
  formatGalleryDate,
  listAudioMedia,
  listGroupCover,
} from '@/lib/gallery'
import styles from './gallery.module.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Gallery',
  description:
    'Photographs and videos from life at Elim Christian Garden International in Bwari, Abuja — our fellowships, services, and celebrations, plus recordings you can listen to anytime.',
}

// Gallery data is cached for ten minutes so page views don't consume the
// Cloudinary Admin API quota on every visit.
const coverFor = (group: string) =>
  unstable_cache(async () => listGroupCover(group), ['gallery-cover', group, 'published-v2'], {
    revalidate: 600,
    tags: ['gallery'],
  })()

const audioForHub = () =>
  unstable_cache(() => listAudioMedia(), ['gallery-audio', 'hub'], {
    revalidate: 600,
    tags: ['gallery'],
  })()

export default async function GalleryPage() {
  const groups = await cachedGroups()
  const options = groupOptions(groups)
  const covers = await Promise.all(
    options.map(async (option) => {
      try {
        return await coverFor(option.id)
      } catch {
        return null
      }
    }),
  )
  let recordings: Awaited<ReturnType<typeof listAudioMedia>> = []
  let recordingsUnavailable = false
  try {
    recordings = (await audioForHub()).slice(0, 3)
  } catch {
    recordingsUnavailable = true
  }

  return (
    <Layout>
      <div className={styles.gallery}>
        <section className={styles.hero} aria-labelledby="gallery-title">
          <div className={styles.container}>
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <ChevronRight size={13} aria-hidden="true" />
              <span aria-current="page">Gallery</span>
            </nav>
            <div className={styles.heroGrid}>
              <div className={styles.heroCopy}>
                <span className={styles.eyebrow}>
                  <span /> OUR CHURCH FAMILY, IN PICTURES
                </span>
                <h1 id="gallery-title">
                  Moments we’ve
                  <br />
                  <em>shared.</em>
                </h1>
                <p>
                  Step into life at Elim. Every fellowship keeps its own
                  collection of photographs and videos from gatherings,
                  celebrations, and everyday moments of faith.
                </p>
                <a href="#galleries" className={styles.greenButton}>
                  Browse the galleries <ArrowDown size={17} aria-hidden="true" />
                </a>
              </div>
              <div className={styles.heroAside}>
                <Camera size={30} strokeWidth={1.2} aria-hidden="true" />
                <span className={styles.smallLabel}>
                  GALLERY AT A GLANCE
                </span>
                <p>
                  Browse by fellowship to see what each group has been up to, or
                  put on a recording and let the sounds of the family encourage
                  you wherever you are.
                </p>
                <div className={styles.heroAsideLinks}>
                  <a href="#galleries">
                    {options.length} galleries{' '}
                    <ArrowDown size={15} aria-hidden="true" />
                  </a>
                  <a href="#recordings">
                    Recordings <ArrowDown size={15} aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className={`${styles.container} ${styles.galleries}`}
          id="galleries"
          aria-labelledby="galleries-heading"
        >
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>
                <span /> A PLACE FOR EVERY GROUP
              </span>
              <h2 id="galleries-heading">
                Find your
                <br />
                <em>people’s moments.</em>
              </h2>
            </div>
            <p>
              Each gallery grows as our media team shares new photographs and
              videos. Choose a group to step inside.
            </p>
          </div>
          <div className={styles.groupGrid}>
            {options.map((option, index) => {
              const info = groupDetails(groups, option.id)
              const cover = covers[index]
              return (
                <a
                  className={styles.groupCard}
                  href={`/gallery/${option.id}`}
                  key={option.id}
                >
                  <div className={styles.cardImage}>
                    {cover ? (
                      <Image
                        src={deliveryUrl(cover.url, 900)}
                        alt={cover.description || `A moment from ${option.label}`}
                        fill
                        unoptimized
                        className={styles.cover}
                      />
                    ) : (
                      <span className={styles.cardPlaceholder}>
                        <Images size={30} strokeWidth={1.2} aria-hidden="true" />
                        <span>FIRST MOMENTS COMING SOON</span>
                      </span>
                    )}
                  </div>
                  <div className={styles.cardCopy}>
                    <span className={styles.smallLabel}>
                      {info?.category ?? 'GALLERY'}
                    </span>
                    <h3>{option.label}</h3>
                    <p>
                      {info?.description ??
                        'Photographs and videos from life in this group.'}
                    </p>
                    <span className={styles.textLink}>
                      View gallery <ArrowUpRight size={17} aria-hidden="true" />
                    </span>
                  </div>
                </a>
              )
            })}
          </div>
        </section>

        <section
          className={styles.recordings}
          id="recordings"
          aria-labelledby="recordings-heading"
        >
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.eyebrow}>
                  <span /> RECORDINGS
                </span>
                <h2 id="recordings-heading">
                  The sounds of
                  <br />
                  <em>the family.</em>
                </h2>
              </div>
              <div className={styles.recordingsAside}>
                <p>
                  Songs and recordings from our gatherings. Press play and
                  worship along at home.
                </p>
                <Link href="/gallery/audio" className={styles.textLink}>
                  All recordings <ArrowUpRight size={17} aria-hidden="true" />
                </Link>
              </div>
            </div>
            {recordingsUnavailable ? (
              <p className={styles.recordingsEmpty} role="status">
                We couldn’t reach the recordings just now. Please refresh in a
                moment.
              </p>
            ) : recordings.length === 0 ? (
              <div className={styles.recordingsEmpty}>
                <strong>Nothing to play just yet.</strong>
                Recordings shared by our media team will appear here.
              </div>
            ) : (
              <div className={styles.audioList}>
                {recordings.map((recording) => (
                  <article
                    className={styles.audioCard}
                    key={recording.id}
                  >
                    <span className={styles.audioIcon}>
                      <AudioLines
                        size={24}
                        strokeWidth={1.3}
                        aria-hidden="true"
                      />
                    </span>
                    <div className={styles.audioBody}>
                      <h3>{recording.title}</h3>
                      {recording.description && <p>{recording.description}</p>}
                      <audio
                        controls
                        preload="none"
                        src={recording.url}
                        aria-label={`Play ${recording.title}`}
                      />
                      <time dateTime={recording.createdAt}>
                        Shared {formatGalleryDate(recording.createdAt)}
                      </time>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section
          className={styles.invitation}
          aria-labelledby="invitation-heading"
        >
          <div className={`${styles.container} ${styles.invitationInner}`}>
            <div>
              <span className={styles.eyebrow}>
                <span /> MAKE SOME MEMORIES OF YOUR OWN
              </span>
              <h2 id="invitation-heading">
                The next moment
                <br />
                <em>could be yours.</em>
              </h2>
              <div className={styles.visitDetails}>
                <span>
                  <Clock3 size={16} aria-hidden="true" /> Sundays at{' '}
                  {church.sundayTime}
                </span>
                <span>
                  <MapPin size={16} aria-hidden="true" /> Bwari, Abuja
                </span>
              </div>
            </div>
            <div className={styles.invitationActions}>
              <Link href="/#visit" className={styles.greenButton}>
                Plan your visit <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
              <Link href="/community" className={styles.textLink}>
                Find your fellowship <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}
