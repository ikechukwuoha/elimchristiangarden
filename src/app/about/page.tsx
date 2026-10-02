import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  Clock3,
  HeartHandshake,
  Leaf,
  MapPin,
  Sprout,
  TreePalm,
  Users,
} from 'lucide-react'
import Layout from '@/components/Layout'
import { church } from '@/app/data/church'
import styles from './about.module.css'

export const metadata: Metadata = {
  title: 'Our Church',
  description:
    'Discover the story, values, and people of Elim Christian Garden International. A family of faith in Bwari, Abuja, watering lives for fruitfulness since 2015.',
}

const values = [
  {
    number: '01',
    Icon: BookOpen,
    name: 'Rooted in the Word',
    label: 'BIBLICAL TRUTH',
    description:
      'The Bible is the foundation of our faith. We are committed to teaching its truth and putting it into practice in the everyday moments of life.',
    invitation: 'A faith that shapes how we live.',
  },
  {
    number: '02',
    Icon: Users,
    name: 'Made for each other',
    label: 'AUTHENTIC COMMUNITY',
    description:
      'We make room for real relationships. We celebrate together, walk through challenges together, and encourage one another to grow in Christ.',
    invitation: 'A family where you can belong.',
  },
  {
    number: '03',
    Icon: HeartHandshake,
    name: 'Love in action',
    label: 'COMPASSIONATE SERVICE',
    description:
      'We believe the love of Jesus moves us to serve. Through practical care and compassion, we seek to bring hope to our neighbours and the world around us.',
    invitation: 'A love that reaches beyond Sunday.',
  },
]

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
                    WATERING LIVES FOR FRUITFULNESS <span>SINCE 2015</span>
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
              What guides us <ArrowDown size={14} aria-hidden="true" />
            </a>
            <a href="#our-leadership">
              Our leadership <ArrowDown size={14} aria-hidden="true" />
            </a>
            <a href="#join-us">
              Come and belong <ArrowDown size={14} aria-hidden="true" />
            </a>
          </div>
        </nav>

        <section
          className={`${styles.container} ${styles.story}`}
          id="our-story"
          aria-labelledby="story-heading"
        >
          <div className={styles.storyCopy}>
            <span className={styles.eyebrow}>
              <span /> OUR STORY
            </span>
            <h2 id="story-heading">
              A place of refreshing.
              <br />
              <em>A life of fruitfulness.</em>
            </h2>
            <p className={styles.intro}>
              Every family has a story. Ours began with a simple vision: to
              create a place where lives are refreshed and faith can flourish.
            </p>
            <p>
              Founded in 2005, Elim Christian Garden International began as a
              small gathering with a heart for worship, spiritual growth, and
              fellowship. Today, that same heart continues to shape our church
              family.
            </p>
            <p>
              Our name comes from Elim, the place of rest and refreshment
              described in Exodus 15:27. Just as those springs offered renewal
              on a long journey, we want our church to be a place where people
              find hope, encouragement, and new strength in God.
            </p>
            <div className={styles.storySignature}>
              <Leaf size={24} strokeWidth={1.3} aria-hidden="true" />
              <span>
                Our roots are in Christ.
                <br />
                <strong>Our hearts are open to you.</strong>
              </span>
            </div>
          </div>
          <aside className={styles.originCard} aria-label="The meaning of Elim">
            <TreePalm
              className={styles.originPalm}
              size={180}
              strokeWidth={0.7}
              aria-hidden="true"
            />
            <span className={styles.originLabel}>
              THE HEART BEHIND OUR NAME
            </span>
            <h3>Elim.</h3>
            <span className={styles.originSubtitle}>
              A place to be refreshed.
            </span>
            <blockquote>
              “And they came to Elim, where were twelve wells of water, and
              threescore and ten palm trees.”
            </blockquote>
            <cite>EXODUS 15:27</cite>
            <div className={styles.originNumbers}>
              <div>
                <span>12</span>
                <p>WELLS OF WATER</p>
              </div>
              <div>
                <span>70</span>
                <p>PALM TREES</p>
              </div>
            </div>
            <p className={styles.originFootnote}>
              The biblical place that inspires our name and our heart for
              spiritual renewal.
            </p>
          </aside>
        </section>

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
                Our values are more than words. They shape the way we worship,
                build relationships, and care for the people around us.
              </p>
            </div>
            <div className={styles.valuesGrid}>
              {values.map(
                ({ number, Icon, name, label, description, invitation }) => (
                  <article key={number} className={styles.value}>
                    <div className={styles.valueTop}>
                      <span className={styles.valueIcon}>
                        <Icon size={27} strokeWidth={1.3} aria-hidden="true" />
                      </span>
                      <span>{number}</span>
                    </div>
                    <span className={styles.valueLabel}>{label}</span>
                    <h3>{name}</h3>
                    <p>{description}</p>
                    <div className={styles.valueInvitation}>{invitation}</div>
                  </article>
                ),
              )}
            </div>
            <div className={styles.mission}>
              <Sprout size={34} strokeWidth={1.2} aria-hidden="true" />
              <div>
                <span>OUR MISSION</span>
                <p>
                  To nourish faith, build community, and equip people to live
                  out the love of Christ every day.
                </p>
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
              href={`mailto:${church.email}?subject=Hello%20to%20the%20Elim%20team`}
              className={styles.textLink}
            >
              Say hello to our team{' '}
              <ArrowUpRight size={18} aria-hidden="true" />
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
