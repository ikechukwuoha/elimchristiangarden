import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  Clock3,
  Droplets,
  HandHeart,
  ShieldCheck,
  HeartHandshake,
  MapPin,
  Sprout,
  Users,
} from 'lucide-react'
import Layout from '@/components/Layout'
import { FaWhatsapp } from 'react-icons/fa'
import { church, whatsappLink } from '@/app/data/church'
import { churchFoundedYear, churchMission, churchValues } from '@/app/data/about'
import ChurchStoryBook from '@/components/about/ChurchStoryBook'
import styles from './about.module.css'

export const metadata: Metadata = {
  title: 'Our Church',
  description: `Discover the story, vision, mission, and five F’s of Elim Christian Garden International. A family of faith in Bwari, Abuja, founded in ${churchFoundedYear}.`,
}

const valueIcons = {
  faithfulness: ShieldCheck,
  fruitfulness: Sprout,
  fatherhood: Users,
  freshness: Droplets,
  fullness: HandHeart,
}

const leaders = [
  {
    name: 'Rev. Dr. Emmanuel Olowononi',
    role: 'FOUNDER & SENIOR PASTOR',
    image: '/images/leader2.jpg',
    position: '50% 30%',
    description:
      'Rev. Dr. Emmanuel Olowononi leads Elim with a passion for biblical teaching, spiritual growth, and community. His ministry connects the wisdom of Scripture with the practical challenges of everyday life.',
    details:
      'Alongside his pastoral calling, he brings an academic background in sports law and experience in public speaking. His work encourages people to pursue purpose in both their faith and their professional lives.',
  },
  {
    name: 'Pastor Emmanuel Olorunmola',
    role: 'ASSISTANT PASTOR',
    image: '/images/leader1.jpg',
    position: '58% 35%',
    description:
      'Pastor Emmanuel Olorunmola serves alongside the senior pastor, supporting the life and ministry of Elim Christian Garden International.',
    details:
      'As assistant pastor, he works with the leadership team to guide and support our church family in its journey of faith.',
  },
  {
    name: 'Dr. Pastor Mrs Damilola Olowononi',
    role: 'MOTHER IN ISRAEL',
    image: '/images/leader3.jpg',
    position: '40% 35%',
    description:
      'Dr. Pastor Mrs Damilola Olowononi is a medical doctor with a heart for helping people discover their purpose and grow in faith.',
    details:
      'She serves alongside her husband, Rev. Dr. Emmanuel Olowononi, bringing care and encouragement to the Elim church family.',
  },
]

export default function About() {
  return (
    <Layout>
      <div className={styles.about}>
        <section className={styles.hero} aria-labelledby="about-title">
          <div className={styles.container}>
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <ChevronRight size={13} aria-hidden="true" />
              <span aria-current="page">Our church</span>
            </nav>
            <div className={styles.heroGrid}>
              <div className={styles.heroCopy}>
                <span className={styles.eyebrow}>
                  <span /> THIS IS ELIM
                </span>
                <h1 id="about-title">
                  Planted in faith.
                  <br />
                  <em>Rooted in love.</em>
                </h1>
                <p>
                  We’re a family of believers in Bwari, Abuja, growing together
                  in the love of Jesus. A place to find refreshing, discover
                  purpose, and feel at home.
                </p>
                <Link href="#our-story" className={styles.greenButton}>
                  Discover our story <ArrowDown size={17} aria-hidden="true" />
                </Link>
                <div className={styles.heroNote}>
                  <span />
                  <p>
                    WATERING LIVES FOR FRUITFULNESS{' '}
                    <span>SINCE {churchFoundedYear}</span>
                  </p>
                </div>
              </div>
              <div className={styles.heroPhotos}>
                <div className={styles.heroPhoto}>
                  <Image
                    src="/images/worship.jpg"
                    alt="Our Elim church family worshipping together"
                    fill
                    sizes="(max-width: 760px) 90vw, 44vw"
                    preload
                    className={styles.cover}
                  />
                </div>
                <div className={styles.heroInset}>
                  <Image
                    src="/images/church-history.jpg"
                    alt="A shared moment in the life of Elim Christian Garden"
                    fill
                    sizes="(max-width: 760px) 48vw, 22vw"
                    className={styles.cover}
                  />
                </div>
                <div className={styles.heroSeal}>
                  <Sprout size={27} strokeWidth={1.2} aria-hidden="true" />
                  <span>
                    ONE FAITH.
                    <br />
                    ONE FAMILY.
                  </span>
                </div>
                <span className={styles.photoCaption}>
                  REAL PEOPLE. A SHARED JOURNEY.
                </span>
              </div>
            </div>
          </div>
        </section>

        <nav className={styles.pageNav} aria-label="On this page">
          <div className={styles.container}>
            <span>GET TO KNOW US</span>
            <a href="#our-story">
              Our story <ArrowDown size={14} aria-hidden="true" />
            </a>
            <a href="#our-values">
              The five F’s <ArrowDown size={14} aria-hidden="true" />
            </a>
            <a href="#our-leadership">
              Our leadership <ArrowDown size={14} aria-hidden="true" />
            </a>
            <a href="#join-us">
              Come and belong <ArrowDown size={14} aria-hidden="true" />
            </a>
          </div>
        </nav>

        <ChurchStoryBook />

        <section
          className={styles.values}
          id="our-values"
          aria-labelledby="values-heading"
        >
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.eyebrow}>
                  <span /> THE HEART OF OUR CHURCH
                </span>
                <h2 id="values-heading">
                  What we believe.
                  <br />
                  <em>How we live.</em>
                </h2>
              </div>
              <p>
                Our five F’s shape the way we worship, grow, build relationships,
                and care for the people around us.
              </p>
            </div>
            <div className={styles.valuesGrid}>
              {churchValues.map(
                ({ id, name, label, description, invitation }, index) => {
                  const Icon = valueIcons[id]
                  return (
                    <article key={id} className={styles.value}>
                      <div className={styles.valueTop}>
                        <span className={styles.valueIcon}>
                          <Icon size={27} strokeWidth={1.3} aria-hidden="true" />
                        </span>
                        <span>{String(index + 1).padStart(2, '0')}</span>
                      </div>
                      <span className={styles.valueLabel}>{label}</span>
                      <h3>{name}</h3>
                      <p>{description}</p>
                      <div className={styles.valueInvitation}>{invitation}</div>
                    </article>
                  )
                },
              )}
            </div>
            <div className={styles.mission}>
              <Sprout size={34} strokeWidth={1.2} aria-hidden="true" />
              <div>
                <span>OUR MISSION</span>
                <p>{churchMission}</p>
              </div>
            </div>
          </div>
        </section>

        <section
          className={`${styles.container} ${styles.leadership}`}
          id="our-leadership"
          aria-labelledby="leadership-heading"
        >
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>
                <span /> PEOPLE WITH A HEART TO SERVE
              </span>
              <h2 id="leadership-heading">
                Leading with faith.
                <br />
                <em>Serving with love.</em>
              </h2>
            </div>
            <p>
              Meet the people who guide and encourage our church family as we
              follow Jesus together.
            </p>
          </div>
          <div className={styles.leadersGrid}>
            {leaders.map((leader) => (
              <article className={styles.leader} key={leader.name}>
                <div className={styles.leaderPhoto}>
                  <Image
                    src={leader.image}
                    alt={leader.name}
                    fill
                    sizes="(max-width: 760px) 90vw, 33vw"
                    className={styles.cover}
                    style={{ objectPosition: leader.position }}
                  />
                </div>
                <div className={styles.leaderCopy}>
                  <span>{leader.role}</span>
                  <h3>{leader.name}</h3>
                  <p>{leader.description}</p>
                  <details>
                    <summary>
                      More about{' '}
                      {leader.name.includes('Damilola')
                        ? 'Dr. Damilola'
                        : leader.role === 'ASSISTANT PASTOR'
                          ? 'Pastor Emmanuel'
                          : 'our senior pastor'}
                      <span className={styles.detailsIcon} aria-hidden="true">
                        +
                      </span>
                    </summary>
                    <p>{leader.details}</p>
                  </details>
                </div>
              </article>
            ))}
          </div>
          <div className={styles.leadershipNote}>
            <p>We’d love to get to know you, too.</p>
            <a
              href={whatsappLink('Hello to the Elim team!')}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.textLink}
            >
              Say hello to our team <FaWhatsapp size={18} aria-hidden="true" />
            </a>
          </div>
        </section>

        <section
          className={styles.belong}
          id="join-us"
          aria-labelledby="belong-heading"
        >
          <div className={`${styles.container} ${styles.belongGrid}`}>
            <div className={styles.belongImage}>
              <Image
                src="/images/teenagerandchildren.jpg"
                alt="Different generations sharing life and fellowship at Elim"
                fill
                sizes="(max-width: 760px) 90vw, 40vw"
                className={styles.cover}
              />
              <div>
                <HeartHandshake
                  size={20}
                  strokeWidth={1.4}
                  aria-hidden="true"
                />
                <span>THERE’S ROOM FOR YOUR STORY HERE.</span>
              </div>
            </div>
            <div className={styles.belongCopy}>
              <span className={styles.eyebrow}>
                <span /> THE NEXT CHAPTER INCLUDES YOU
              </span>
              <h2 id="belong-heading">
                Come as you are.
                <br />
                <em>Find your family.</em>
              </h2>
              <p>
                You don’t have to have everything figured out to take a first
                step. Join us for a Sunday of worship, encouragement, and
                connection.
              </p>
              <div className={styles.visitDetails}>
                <span>
                  <Clock3 size={17} aria-hidden="true" /> Sundays at{' '}
                  {church.sundayTime}
                </span>
                <span>
                  <MapPin size={17} aria-hidden="true" /> Elim Garden, Bwari,
                  Abuja
                </span>
              </div>
              <div className={styles.belongActions}>
                <Link href="/#visit" className={styles.greenButton}>
                  Plan your first visit{' '}
                  <ArrowUpRight size={18} aria-hidden="true" />
                </Link>
                <a
                  href={church.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.textLink}
                >
                  Get directions <ArrowRight size={17} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}
