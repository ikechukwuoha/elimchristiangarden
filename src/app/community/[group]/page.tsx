import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { cache } from 'react'
import { notFound, redirect } from 'next/navigation'
import { ArrowDown, ArrowUpRight, BookOpen, Check, ChevronRight, Clock3, HeartHandshake, Images, MapPin, MessageCircle, Users } from 'lucide-react'
import Layout from '@/components/Layout'
import CommunityRefresh from '@/components/community/CommunityRefresh'
import { whatsappLink } from '@/app/data/church'
import { cachedGroups } from '@/lib/community-cache'
import { communityWithPhotos } from '@/lib/community-images'
import type { CommunityGroup } from '@/lib/community'
import { deliveryUrl } from '@/lib/gallery'
import styles from './group.module.css'

export const dynamic = 'force-dynamic'
type Props = { params: Promise<{ group: string }> }
const loadGroups = cache(() => cachedGroups({ strict: true }))

function findGroup(groups: CommunityGroup[], id: string) {
  return groups.find((item) => item.id === id) ||
    (id === 'tehilla' ? groups.find((item) => item.id === 'tehillah-ministries') : undefined)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { group } = await params
  try {
    const info = findGroup(await loadGroups(), group)
    if (!info) return { title: 'Community', robots: { index: false } }
    return { title: info.title, description: info.description, alternates: { canonical: `/community/${info.id}` } }
  } catch {
    return { title: 'Community', robots: { index: false } }
  }
}

export default async function CommunityGroupPage({ params }: Props) {
  const { group: id } = await params
  let groups: CommunityGroup[]
  try {
    groups = await loadGroups()
  } catch {
    return <Layout><div className={styles.page}><div className={styles.container}>
      <h1 className={styles.unavailableTitle}>Group details</h1>
      <CommunityRefresh unavailable className={styles.notice} message="We couldn’t load this group’s details just now. Please try again shortly." />
      <Link href="/community" className={styles.textLink}>Back to our community <ArrowUpRight size={17} aria-hidden="true" /></Link>
    </div></div></Layout>
  }
  const savedGroup = findGroup(groups, id)
  if (!savedGroup) notFound()
  if (savedGroup.id !== id) redirect(`/community/${savedGroup.id}`)
  const [group] = await communityWithPhotos([savedGroup])
  const fellowship = group.kind === 'fellowship'
  const cloudinaryImage = group.image.startsWith('https://res.cloudinary.com/')
  const about = (group.details || group.description).split(/\n\s*\n/).filter((paragraph) => paragraph.trim())
  const related = groups.filter((item) => item.id !== group.id && item.kind === group.kind).slice(0, 3)
  const contact = whatsappLink(`Hello! I would like to know more about ${group.title} and how to get involved.`)

  return (
    <Layout>
      <div className={styles.page}>
        <CommunityRefresh />
        <header className={`${styles.container} ${styles.hero}`}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/">Home</Link><ChevronRight size={13} aria-hidden="true" />
            <Link href="/community">Community</Link><ChevronRight size={13} aria-hidden="true" />
            <span aria-current="page">{group.title}</span>
          </nav>
          <div className={styles.heroGrid}>
            <div>
              <span className={styles.eyebrow}>{fellowship ? 'FELLOWSHIP' : 'UNIT'}{group.category.toLowerCase() !== group.kind && ` · ${group.category}`}</span>
              <h1>{group.title}</h1>
              <p className={styles.intro}>{group.description}</p>
              <div className={styles.actions}>
                <a href="#about" className={styles.primaryButton}>Get to know us <ArrowDown size={17} aria-hidden="true" /></a>
                <Link href={`/gallery/${group.id}`} className={styles.textLink}><Images size={17} aria-hidden="true" /> View gallery <ArrowUpRight size={16} aria-hidden="true" /></Link>
              </div>
            </div>
            <div className={styles.heroPhoto}>
              {group.image ? <Image src={cloudinaryImage ? deliveryUrl(group.image, 1200) : group.image} alt={group.alt} fill unoptimized={cloudinaryImage} loading="eager" fetchPriority="high" sizes="(max-width: 760px) 100vw, 45vw" className={styles.cover} /> : <div className={styles.photoPlaceholder}>
                {fellowship ? <Users size={52} strokeWidth={1} aria-hidden="true" /> : <HeartHandshake size={52} strokeWidth={1} aria-hidden="true" />}
                <span>{fellowship ? 'A place to belong.' : 'A place to serve.'}</span>
              </div>}
            </div>
          </div>
        </header>

        <div className={`${styles.container} ${styles.contentGrid}`}>
          <div>
            <section id="about" className={styles.about} aria-labelledby="about-heading">
              <span className={styles.eyebrow}><BookOpen size={16} aria-hidden="true" /> OUR PLACE IN THE ELIM FAMILY</span>
              <h2 id="about-heading">{fellowship ? 'About our fellowship.' : 'About this unit.'}</h2>
              <div className={styles.prose}>{about.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
            </section>
            {group.activities.length > 0 && <section className={styles.activities} aria-labelledby="activities-heading">
              <span className={styles.eyebrow}>WHAT WE DO</span>
              <h2 id="activities-heading">Life together.</h2>
              <ul>{group.activities.map((activity) => <li key={activity}><Check size={18} aria-hidden="true" /><span>{activity}</span></li>)}</ul>
            </section>}
          </div>
          <aside className={styles.joinCard} aria-labelledby="join-heading">
            <span className={styles.eyebrow}>TAKE THE NEXT STEP</span>
            <h2 id="join-heading">{fellowship ? 'Find your place.' : 'Bring your gifts.'}</h2>
            <dl className={styles.facts}>
              {group.audience && <div><dt><Users size={16} aria-hidden="true" /> Who it’s for</dt><dd>{group.audience}</dd></div>}
              {group.leader && <div><dt><HeartHandshake size={16} aria-hidden="true" /> Group leader</dt><dd>{group.leader}</dd></div>}
              {group.meetingTime && <div><dt><Clock3 size={16} aria-hidden="true" /> When we meet</dt><dd>{group.meetingTime}</dd></div>}
              {group.meetingLocation && <div><dt><MapPin size={16} aria-hidden="true" /> Where we meet</dt><dd>{group.meetingLocation}</dd></div>}
            </dl>
            <p>Message our team to ask about {fellowship ? 'joining the fellowship' : 'serving with the unit'}, our next gathering, and what to expect.</p>
            <a href={contact} target="_blank" rel="noopener noreferrer" className={styles.primaryButton}><MessageCircle size={18} aria-hidden="true" /> Chat on WhatsApp <ArrowUpRight size={16} aria-hidden="true" /></a>
          </aside>
        </div>

        {related.length > 0 && <section className={styles.related} aria-labelledby="related-heading">
          <div className={styles.container}>
            <span className={styles.eyebrow}>MORE OF OUR CHURCH FAMILY</span>
            <h2 id="related-heading">Explore other {fellowship ? 'fellowships' : 'units'}.</h2>
            <div className={styles.relatedGrid}>{related.map((item) => <Link key={item.id} href={`/community/${item.id}`} className={styles.relatedCard}>
              <span>{item.category}</span><h3>{item.title}</h3><p>{item.description}</p>
              <span className={styles.relatedAction}>Get to know us <ArrowUpRight size={17} aria-hidden="true" /></span>
            </Link>)}</div>
          </div>
        </section>}
      </div>
    </Layout>
  )
}
