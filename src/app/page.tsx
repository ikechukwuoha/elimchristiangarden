import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  ChevronDown,
  Clock3,
  Heart,
  Images,
  Leaf,
  MapPin,
  MoveUpRight,
  Sun,
  Users,
} from 'lucide-react'
import Layout from '@/components/Layout'
import HeroSlider from '@/components/HeroSlider'
import { cachedHeroPhotos } from '@/lib/hero-images'
import { cachedGroups } from '@/lib/community-cache'
import { communityWithPhotos } from '@/lib/community-images'
import { deliveryUrl } from '@/lib/gallery'
import { FaWhatsapp } from 'react-icons/fa'
import { church, whatsappLink } from './data/church'
import { cachedMessageLibrary } from '@/lib/message-cache'
import MessageArtwork from '@/components/sermons/MessageArtwork'
import CommunityRefresh from '@/components/community/CommunityRefresh'
import styles from './home.module.css'

export const metadata: Metadata = {
  title: 'Welcome Home',
  description: `A place to belong, believe, and grow. Join Elim Christian Garden International in Bwari, Abuja for Sunday worship at ${church.sundayTime}.`,
}

const gatherings = [
  {
    day: 'SUN',
    frequency: 'EVERY SUNDAY',
    name: 'Sunday worship',
    description:
      'A fresh start to your week. Worship, the Word, and a warm welcome.',
    time: `${church.sundayTime} – ${church.sundayEnd}`,
    location: 'Main sanctuary',
  },
  {
    day: 'SAT',
    frequency: 'EVERY FIRST & LAST SATURDAY',
    name: 'Apostolic Meeting',
    description:
      'Make room to pray, reflect on Scripture, and seek God together.',
    time: '7:00 AM – 9:00 AM',
    location: 'Main sanctuary',
  },
  {
    day: 'FRI',
    frequency: 'FIRST DAY OF THE MONTH',
    name: 'New month gathering',
    description:
      'Step into a new month with worship, prayer, and thanksgiving.',
    time: '5:30 PM – 7:00 PM',
    location: 'Main sanctuary',
  },
]

export default async function Home() {
  const [photoResult, messageResult, communityResult] = await Promise.allSettled([
    cachedHeroPhotos(), cachedMessageLibrary(), cachedGroups({ strict: true }).then(communityWithPhotos),
  ])
  const photos = photoResult.status === 'fulfilled' ? photoResult.value : []
  const communities = communityResult.status === 'fulfilled' ? communityResult.value : []
  const communityUnavailable = communityResult.status === 'rejected'
  const featuredSermon = messageResult.status === 'fulfilled' ? messageResult.value.messages[0] : undefined
  const messagesUnavailable = messageResult.status === 'rejected' || messageResult.value.unavailableSources.length > 0

  return (
    <Layout>
      <div className={styles.home}>
        <HeroSlider key={photos.map((photo) => photo.id).join(',')} photos={photos} />

        <section
          className={styles.sundayBar}
          aria-label="Sunday service information"
        >
          <div className={styles.sundayInner}>
            <div className={styles.sundayIntro}>
              <span className={styles.sunIcon}>
                <Sun size={25} strokeWidth={1.3} aria-hidden="true" />
              </span>
              <div>
                <span className={styles.smallLabel}>
                  YOUR SUNDAY STARTS HERE
                </span>
                <h2>Come as you are.</h2>
              </div>
            </div>
            <div className={styles.serviceDetail}>
              <Clock3 size={18} aria-hidden="true" />
              <div>
                <strong>Sundays at {church.sundayTime}</strong>
                <span>There’s a seat for you.</span>
              </div>
            </div>
            <div className={styles.serviceDetail}>
              <MapPin size={19} aria-hidden="true" />
              <div>
                <strong>Elim Garden, Bwari</strong>
                <span>Kuduru Express Way, Abuja</span>
              </div>
            </div>
            <a
              href={church.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.textLink}
            >
              Get directions <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </div>
        </section>

        <section
          className={`${styles.section} ${styles.welcome}`}
          id="welcome"
          aria-labelledby="welcome-heading"
        >
          <div className={styles.welcomePhotos}>
            <div className={styles.welcomeMain}>
              <Image
                src="/images/church-main.jpg"
                alt="A minister leading worship at Elim Christian Garden"
                fill
                sizes="(max-width: 599px) 88vw, (max-width: 899px) 423px, 40vw"
                className={styles.cover}
              />
            </div>
            <div className={styles.welcomeSmall}>
              <Image
                src="/images/church-history.jpg"
                alt="Elim church leadership sharing a moment together"
                fill
                sizes="(max-width: 599px) 52vw, (max-width: 899px) 250px, 23vw"
                className={styles.cover}
              />
            </div>
            <div className={styles.welcomeBadge}>
              <Leaf size={25} strokeWidth={1.2} aria-hidden="true" />
              <span>
                Planted in love.
                <br />
                <strong>Growing in grace.</strong>
              </span>
            </div>
            <span className={styles.photoNote}>
              THIS IS ELIM. THIS IS FAMILY.
            </span>
          </div>
          <div className={styles.welcomeCopy}>
            <span className={styles.eyebrow}>
              <span /> WELCOME TO ELIM
            </span>
            <h2 id="welcome-heading">
              More than a church.
              <br />
              <em>A place to call home.</em>
            </h2>
            <p>
              At Elim Christian Garden International, we believe life flourishes
              when we grow together. We are a family of believers learning to
              love God, love people, and live with purpose.
            </p>
            <p>
              Whether you’re exploring faith for the first time or looking for a
              church family, there is room for you here. Come share in worship,
              find encouragement, and take your next step with Jesus.
            </p>
            <div className={styles.welcomeValues}>
              <span>
                <Heart size={16} aria-hidden="true" /> Love deeply
              </span>
              <span>
                <BookOpen size={16} aria-hidden="true" /> Grow in faith
              </span>
              <span>
                <Users size={16} aria-hidden="true" /> Do life together
              </span>
            </div>
            <Link href="/about" className={styles.textLink}>
              Discover our story <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section
          className={styles.community}
          id="community"
          aria-labelledby="community-heading"
        >
          <div className={styles.section}>
            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.eyebrow}>
                  <span /> LIFE IS BETTER TOGETHER
                </span>
                <h2 id="community-heading">
                  Find your people.
                  <br />
                  <em>Grow your purpose.</em>
                </h2>
              </div>
              <p>
                There’s a place for every age and every season of life. Find a
                community where you can belong and become.
              </p>
            </div>
            <CommunityRefresh unavailable={communityUnavailable} className={styles.communityNotice} />
            {!communityUnavailable && communities.length === 0 && (
              <p className={styles.communityNotice} role="status">
                No fellowships or units have been added yet.
              </p>
            )}
            <div className={styles.communityGrid}>
              {communities.map((community, index) => (
                <Link
                  className={styles.communityCard}
                  key={community.id}
                  href={`/community/${community.id}`}
                  aria-label={`Explore ${community.title}`}
                >
                  <div className={styles.communityImage}>
                    {community.image ? (
                      <Image
                        src={community.image.startsWith('https://res.cloudinary.com/') ? deliveryUrl(community.image, 1000) : community.image}
                        alt={community.alt}
                        fill
                        unoptimized={community.image.startsWith('https://res.cloudinary.com/')}
                        sizes="(max-width: 599px) calc(100vw - 40px), (max-width: 899px) calc((100vw - 88px) / 2), (max-width: 1239px) 30vw, 370px"
                        className={styles.cover}
                      />
                    ) : (
                      <span className={styles.communityPlaceholder}>
                        <Images size={32} strokeWidth={1.2} aria-hidden="true" />
                        <span>PHOTOGRAPHS COMING SOON</span>
                      </span>
                    )}
                    <span className={styles.cardNumber}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className={styles.cardArrow}>
                      <ArrowUpRight size={22} aria-hidden="true" />
                    </span>
                  </div>
                  <div className={styles.communityCopy}>
                    <span>{community.category}</span>
                    <h3>{community.title}</h3>
                    <p>{community.description}</p>
                    <div className={styles.communityAction}>
                      Get to know us <ArrowRight size={15} aria-hidden="true" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/community" className={styles.textLink}>
              Explore our fellowships and units <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className={styles.message} aria-labelledby="message-heading">
          <div className={`${styles.section} ${styles.messageInner}`}>
            <div className={styles.messageCopy}>
              <span className={styles.eyebrow}>
                <span /> THE WORD FOR YOUR EVERYDAY
              </span>
              <h2 id="message-heading">
                A little encouragement.
                <br />
                <em>A deeper faith.</em>
              </h2>
              <p>
                Carry the Word with you beyond Sunday. Explore messages that
                help you follow Jesus in the everyday moments of life.
              </p>
              <Link href="/sermons" className={styles.lightLink}>
                Explore all messages{' '}
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
              <div className={styles.messageVerse}>
                <BookOpen size={20} strokeWidth={1.4} aria-hidden="true" />
                <p>
                  “Thy word is a lamp unto my feet,
                  <br />
                  and a light unto my path.”<span>PSALM 119:105</span>
                </p>
              </div>
            </div>
            {featuredSermon ? <Link
              href={`/sermon/${featuredSermon.id}`}
              className={styles.featuredMessage}
            >
              <div className={styles.messageImage}>
                <MessageArtwork title={featuredSermon.title} series={featuredSermon.series} imageUrl={featuredSermon.imageUrl} large />
                <span className={styles.messageTag}>FEATURED MESSAGE</span>
                <span className={styles.messageOpen}>
                  <MoveUpRight size={26} aria-hidden="true" />
                </span>
              </div>
              <div className={styles.messageCardCopy}>
                {(featuredSermon.series || featuredSermon.scripture) && <span>
                  {[featuredSermon.series, featuredSermon.scripture].filter(Boolean).join(' • ')}
                </span>}
                <h3>{featuredSermon.title}</h3>
                <div>
                  {featuredSermon.preacher.name && <p>{featuredSermon.preacher.name}</p>}
                  <span>
                    Explore message <ArrowRight size={16} aria-hidden="true" />
                  </span>
                </div>
              </div>
            </Link> : <div className={styles.featuredMessage}>
              <div className={styles.messageCardCopy} role="status">
                <h3>{messagesUnavailable ? 'Messages could not be loaded' : 'No messages published yet'}</h3>
                <p>{messagesUnavailable ? 'Please try again in a moment.' : 'Our audio and YouTube recordings will appear here once published.'}</p>
              </div>
            </div>}
          </div>
        </section>

        <section
          className={`${styles.section} ${styles.gatherings}`}
          id="gatherings"
          aria-labelledby="gatherings-heading"
        >
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>
                <span /> MAKE ROOM FOR WHAT MATTERS
              </span>
              <h2 id="gatherings-heading">
                Let’s gather <em>together.</em>
              </h2>
            </div>
            <Link href="#visit" className={styles.textLink}>
              Your first visit <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <div className={styles.gatheringList}>
            {gatherings.map((gathering) => (
              <article className={styles.gathering} key={gathering.day}>
                <div className={styles.dayTile}>
                  <CalendarDays
                    size={19}
                    strokeWidth={1.3}
                    aria-hidden="true"
                  />
                  <strong>{gathering.day}</strong>
                </div>
                <div className={styles.gatheringInfo}>
                  <span>{gathering.frequency}</span>
                  <h3>{gathering.name}</h3>
                  <p>{gathering.description}</p>
                </div>
                <div className={styles.gatheringTime}>
                  <span>
                    <Clock3 size={15} aria-hidden="true" />
                    {gathering.time}
                  </span>
                  <span>
                    <MapPin size={15} aria-hidden="true" />
                    {gathering.location}
                  </span>
                </div>
                <a
                  href={church.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.gatheringArrow}
                  aria-label={`Get directions for ${gathering.name}`}
                >
                  <ArrowUpRight size={22} aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.scripture} aria-label="Our inspiration">
          <Leaf size={28} strokeWidth={1.2} aria-hidden="true" />
          <p>
            “And they came to Elim, where were twelve wells of water,
            <br className={styles.desktopBreak} /> and threescore and ten palm
            trees.”
          </p>
          <span>
            EXODUS 15:27 <span>—</span> A PLACE OF REFRESHING. A LIFE OF
            FRUITFULNESS.
          </span>
        </section>

        <section
          className={`${styles.section} ${styles.visit}`}
          id="visit"
          aria-labelledby="visit-heading"
        >
          <div className={styles.visitCopy}>
            <span className={styles.eyebrow}>
              <span /> YOUR NEXT STEP STARTS HERE
            </span>
            <h2 id="visit-heading">
              New here?
              <br />
              <em>You’re already welcome.</em>
            </h2>
            <p>
              A new place can feel like a big step. We’d love to make your first
              Sunday a little easier.
            </p>
            <div className={styles.visitAddress}>
              <MapPin size={22} strokeWidth={1.5} aria-hidden="true" />
              <div>
                <strong>Find us in Bwari, Abuja</strong>
                <p>{church.address}</p>
              </div>
            </div>
            <div className={styles.visitActions}>
              <a
                href={church.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.greenButton}
              >
                Get directions <ArrowUpRight size={18} aria-hidden="true" />
              </a>
              <a
                href={whatsappLink(
                  'Hello! I would like to plan my first visit to Elim.',
                )}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.textLink}
              >
                Say hello <FaWhatsapp size={17} aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className={styles.faqs}>
            <details open>
              <summary>
                What can I expect on a Sunday?
                <ChevronDown size={18} aria-hidden="true" />
              </summary>
              <p>
                Our Sunday gathering is a time of worship, prayer, and Bible
                teaching. Come ready to connect with God and meet our church
                family. You’re welcome whether you’re new to faith or have been
                following Jesus for years.
              </p>
            </details>
            <details>
              <summary>
                What time should I arrive?
                <ChevronDown size={18} aria-hidden="true" />
              </summary>
              <p>
                Our Sunday service begins at {church.sundayTime} and finishes
                around {church.sundayEnd}. Arriving a few minutes early gives
                you time to settle in and say hello.
              </p>
            </details>
            <details>
              <summary>
                Can I come with my family?
                <ChevronDown size={18} aria-hidden="true" />
              </summary>
              <p>
                Absolutely. People of all ages are welcome at Elim, including
                children and teenagers.{' '}
                <a
                  href={whatsappLink(
                    'Hello! I would like to visit Elim with my family.',
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contact us on WhatsApp
                </a>{' '}
                before your visit if you’d like to learn more about our
                children’s and teenagers’ ministry.
              </p>
            </details>
            <details>
              <summary>
                Do I need to register or dress a certain way?
                <ChevronDown size={18} aria-hidden="true" />
              </summary>
              <p>
                You can simply join us for Sunday worship. Wear what feels
                comfortable to you. We’re looking forward to meeting you.
              </p>
            </details>
          </div>
        </section>
      </div>
    </Layout>
  )
}
