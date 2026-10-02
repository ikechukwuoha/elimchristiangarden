import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowUpRight,
  Camera,
  ChevronRight,
  Clock3,
  Film,
  Images,
  MapPin,
} from 'lucide-react'
import { unstable_cache } from 'next/cache'
import { notFound, redirect } from 'next/navigation'
import Layout from '@/components/Layout'
import GalleryCarousel from '@/components/gallery/GalleryCarousel'
import { church } from '@/app/data/church'
import { cachedGroups } from '@/lib/community-cache'
import { groupDetails } from '@/lib/community'
import {
  deliveryUrl,
  formatGalleryDate,
  listGroupMedia,
  type GroupMedia,
} from '@/lib/gallery'
import styles from '../gallery.module.css'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: PageProps<'/gallery/[group]'>): Promise<Metadata> {
  const { group } = await params
  const info = groupDetails(await cachedGroups(), group)
  if (!info) return { title: 'Gallery' }
  return {
    title: `${info.label} gallery`,
    description: `${info.description} Photographs and videos shared by the ${info.label} at Elim Christian Garden International.`,
  }
}

// Gallery data is cached for ten minutes so page views don't consume the
// Cloudinary Admin API quota on every visit.
const mediaFor = (group: string) =>
  unstable_cache(
    async () => listGroupMedia(group),
    ['gallery-group', group, 'published-v2'],
    { revalidate: 600, tags: ['gallery'] },
  )()

export default async function GroupGalleryPage({
  params,
}: PageProps<'/gallery/[group]'>) {
  const { group } = await params
  const groups = await cachedGroups()
  if (group === 'tehilla' && groups.some((item) => item.id === 'tehillah-ministries'))
    redirect('/gallery/tehillah-ministries')
  const info = groupDetails(groups, group)
  if (!info) notFound()
  let media: GroupMedia = { photos: [], videos: [] }
  let unavailable = false
  try {
    media = await mediaFor(group)
  } catch {
    unavailable = true
  }
  const emptyGallery = media.photos.length === 0 && media.videos.length === 0

  return (
    <Layout>
      <div className={styles.gallery}>
        <section className={styles.hero} aria-labelledby="group-title">
          <div className={styles.container}>
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <ChevronRight size={13} aria-hidden="true" />
              <Link href="/gallery">Gallery</Link>
              <ChevronRight size={13} aria-hidden="true" />
              <span aria-current="page">{info.label}</span>
            </nav>
            <div className={`${styles.heroGrid} ${media.photos.length > 0 ? styles.groupHeroGrid : ''}`}>
              <div className={styles.heroCopy}>
                <span className={styles.eyebrow}>
                  <span /> {info.category}
                </span>
                <h1 id="group-title">
                  {info.label}
                  <br />
                  <em>gallery.</em>
                </h1>
                <p>{info.description}</p>
                <div className={styles.heroActions}>
                  <Link href="/gallery" className={styles.greenButton}>
                    All galleries <ArrowUpRight size={17} aria-hidden="true" />
                  </Link>
                  {info.id !== 'church-wide' && <Link href={`/community/${info.id}`} className={styles.textLink}>
                    About this group <ArrowUpRight size={17} aria-hidden="true" />
                  </Link>}
                </div>
              </div>
              {media.photos.length === 0 && (
                <div className={styles.heroAside}>
                  <Camera size={30} strokeWidth={1.2} aria-hidden="true" />
                  <span className={styles.smallLabel}>
                    THIS GALLERY IS GROWING
                  </span>
                  <p>
                    Our media team shares new moments here after our
                    gatherings. Check back soon for photographs and videos
                    from this fellowship.
                  </p>
                </div>
              )}
            </div>
          </div>
          {media.photos.length > 0 && (
            <div className={styles.carouselContainer}>
              <GalleryCarousel
                key={group}
                label={info.label}
                photos={media.photos.map((photo) => ({
                  id: photo.id,
                  src: deliveryUrl(photo.url, 1800),
                  thumbnail: deliveryUrl(photo.url, 200),
                  originalUrl: photo.url,
                  title: photo.title,
                  description: photo.description,
                }))}
              />
            </div>
          )}
        </section>

        <div className={`${styles.container} ${styles.mediaSections}`}>
          {unavailable && (
            <p className={styles.notice} role="status">
              We couldn’t reach this gallery just now. Please refresh in a
              moment — the photographs and videos are safe.
            </p>
          )}
          <section
            className={styles.mediaBlock}
            id="photographs"
            aria-labelledby="photos-heading"
          >
            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.eyebrow}>
                  <span /> PHOTOGRAPHS
                </span>
                <h2 id="photos-heading">
                  Caught on <em>camera.</em>
                </h2>
              </div>
              {media.photos.length > 0 && (
                <p>
                  {media.photos.length}{' '}
                  {media.photos.length === 1 ? 'photograph' : 'photographs'}{' '}
                  from {info.label}. Open any photograph to view it in full.
                </p>
              )}
            </div>
            <div className={styles.photoGrid}>
              {media.photos.length === 0 ? (
                <div className={styles.empty}>
                  <Camera size={32} strokeWidth={1.2} aria-hidden="true" />
                  <h3>No photographs here yet.</h3>
                  <p>
                    Moments from {info.label} will appear here once our media
                    team shares them.
                  </p>
                </div>
              ) : (
                media.photos.map((photo, index) => (
                  <figure className={styles.photoCard} key={photo.id}>
                    <Link
                      href={photo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open ${photo.title} in a new tab`}
                    >
                      <Image
                        src={deliveryUrl(photo.url, 1000)}
                        alt={photo.description || photo.title}
                        fill
                        unoptimized
                        loading={index === 0 ? 'eager' : 'lazy'}
                        className={styles.cover}
                      />
                      <span className={styles.photoCaption}>
                        <span className={styles.photoTitle}>{photo.title}</span>
                        <span>
                          VIEW <ArrowUpRight size={13} aria-hidden="true" />
                        </span>
                      </span>
                    </Link>
                  </figure>
                ))
              )}
            </div>
          </section>

          <section
            className={styles.mediaBlock}
            id="videos"
            aria-labelledby="videos-heading"
          >
            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.eyebrow}>
                  <span /> VIDEOS
                </span>
                <h2 id="videos-heading">
                  In <em>motion.</em>
                </h2>
              </div>
              {media.videos.length > 0 && (
                <p>
                  {media.videos.length}{' '}
                  {media.videos.length === 1 ? 'video' : 'videos'} from{' '}
                  {info.label}. Press play to watch right here.
                </p>
              )}
            </div>
            <div className={styles.videoGrid}>
              {media.videos.length === 0 ? (
                <div className={styles.empty}>
                  <Film size={32} strokeWidth={1.2} aria-hidden="true" />
                  <h3>No videos here yet.</h3>
                  <p>
                    Videos from {info.label} will appear here once our media
                    team shares them.
                  </p>
                </div>
              ) : (
                media.videos.map((video) => (
                  <article className={styles.videoCard} key={video.id}>
                    <video
                      controls
                      preload="metadata"
                      src={video.url}
                      aria-label={`Play ${video.title}`}
                    />
                    <div className={styles.videoCopy}>
                      <h3>{video.title}</h3>
                      {video.description && <p>{video.description}</p>}
                      <time dateTime={video.createdAt}>
                        Shared {formatGalleryDate(video.createdAt)}
                      </time>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          {emptyGallery && (
            <div className={styles.empty}>
              <Images size={32} strokeWidth={1.2} aria-hidden="true" />
              <h3>Watch this space.</h3>
              <p>
                This gallery is ready and waiting. New moments will appear here
                after our next gathering.
              </p>
            </div>
          )}
        </div>

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
