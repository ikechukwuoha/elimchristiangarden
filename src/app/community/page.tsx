import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Clock3,
  HeartHandshake,
  Images,
  Mail,
  MapPin,
  Plus,
  Sprout,
  Users,
} from 'lucide-react'
import Layout from '@/components/Layout'
import { church } from '@/app/data/church'
import { cachedGroups } from '@/lib/community-cache'
import type { CommunityGroup } from '@/lib/community'
import styles from './community.module.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Community',
  description:
    'Find your people at Elim Christian Garden International in Bwari, Abuja. Explore our fellowships, units, and opportunities to serve and grow together.',
}

const steps = [
  {
    title: 'Find a place to begin.',
    description:
      'Explore a fellowship or unit that speaks to your season of life and the gifts you’d like to share.',
  },
  {
    title: 'Say a simple hello.',
    description:
      'Email us about the group you’re interested in, or speak with our team when you visit on Sunday.',
  },
  {
    title: 'Take the next step.',
    description:
      'Ask about the next gathering and how to get involved. Come with your questions and get to know your church family.',
  },
]

const questions = [
  {
    question: 'I’m new to Elim. Where should I start?',
    answer:
      'Start with a Sunday visit or send us an email. You don’t need to have a group in mind yet. Tell us a little about yourself and we’ll help you explore the fellowships and units.',
  },
  {
    question: 'When do the fellowships meet?',
    answer:
      'Gathering times depend on the group. Use the enquiry link for the group you’re interested in to ask our team for its current meeting time, location, and what to expect.',
  },
  {
    question: 'How can I find out more for my child or teenager?',
    answer:
      'Contact us through the Teenagers and Children enquiry link, or speak with our team on Sunday. We can help you find out about age groups, activities, and arrangements for your child’s first visit.',
  },
  {
    question: 'How do I get involved in serving?',
    answer:
      'Let us know which unit interests you and the gifts you’d like to share. The team can explain what serving involves, any preparation needed, and the next step for getting involved.',
  },
]

function enquiry(subject: string) {
  return `mailto:${church.email}?subject=${encodeURIComponent(subject)}`
}

function GroupCard({ group }: { group: CommunityGroup }) {
  return (
    <article className={styles.fellowshipCard} id={group.id} key={group.id}>
      <div className={styles.cardImage}>
        {group.image ? (
          <Image
            src={group.image}
            alt={group.alt}
            fill
            sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"
            className={styles.cover}
          />
        ) : (
          <span className={styles.cardPlaceholder}>
            <Images size={30} strokeWidth={1.2} aria-hidden="true" />
            <span>PHOTOGRAPHS COMING SOON</span>
          </span>
        )}
      </div>
      <div className={styles.cardCopy}>
        <span className={styles.smallLabel}>{group.category}</span>
        <h3>{group.title}</h3>
        <p>{group.description}</p>
        {group.activities.length > 0 && (
          <ul className={styles.cardActivities}>
            {group.activities.map((activity) => (
              <li key={activity}>
                <Check size={15} aria-hidden="true" />
                {activity}
              </li>
            ))}
          </ul>
        )}
        <div className={styles.cardActions}>
          <a
            href={enquiry(`${group.title} enquiry`)}
            className={styles.textLink}
            aria-label={`Ask about ${group.title}`}
          >
            Let’s connect <ArrowUpRight size={17} aria-hidden="true" />
          </a>
          <Link
            href={`/gallery/${group.id}`}
            className={styles.textLink}
            aria-label={`View the ${group.title} gallery`}
          >
            View gallery <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  )
}

export default async function CommunityPage() {
  const groups = await cachedGroups()
  const fellowships = groups.filter((group) => group.kind === 'fellowship')
  const units = groups.filter((group) => group.kind === 'unit')

  return (
    <Layout>
      <div className={styles.community}>
        <section className={styles.hero} aria-labelledby="community-title">
          <div className={styles.container}>
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <ChevronRight size={13} aria-hidden="true" />
              <span aria-current="page">Community</span>
            </nav>
            <div className={styles.heroGrid}>
              <div className={styles.heroCopy}>
                <span className={styles.eyebrow}>
                  <span /> LIFE IS BETTER TOGETHER
                </span>
                <h1 id="community-title">
                  Find your people.
                  <br />
                  <em>Grow together.</em>
                </h1>
                <p>
                  Faith flourishes in good company. Explore our fellowships and
                  units — what they do, when they gather, and the life
                  they share.
                </p>
                <a href="#fellowships" className={styles.greenButton}>
                  Find your community <ArrowDown size={17} aria-hidden="true" />
                </a>
                <div className={styles.heroNote}>
                  <Users size={23} strokeWidth={1.3} aria-hidden="true" />
                  <span>EVERY AGE. EVERY SEASON. ONE FAMILY.</span>
                </div>
              </div>
              <div className={styles.heroPhotos}>
                <div className={styles.heroPhoto}>
                  <Image
                    src="/images/worship.jpg"
                    alt="Our Elim church family sharing in worship"
                    fill
                    sizes="(max-width: 760px) 90vw, 44vw"
                    preload
                    className={styles.cover}
                  />
                </div>
                <div className={styles.heroInset}>
                  <Image
                    src="/images/teenagerandchildren.jpg"
                    alt="Young people taking part in the life of our church"
                    fill
                    sizes="(max-width: 760px) 45vw, 22vw"
                    className={styles.cover}
                  />
                </div>
                <div className={styles.heroSeal}>
                  <HeartHandshake
                    size={27}
                    strokeWidth={1.2}
                    aria-hidden="true"
                  />
                  <span>
                    ROOM FOR
                    <br />
                    YOU HERE.
                  </span>
                </div>
                <span className={styles.photoCaption}>
                  SHARED FAITH. EVERYDAY FRIENDSHIP.
                </span>
              </div>
            </div>
          </div>
        </section>

        <nav className={styles.pageNav} aria-label="On this page">
          <div className={styles.container}>
            <span>MAKE YOURSELF AT HOME</span>
            <a href="#fellowships">
              Fellowships <ArrowDown size={14} aria-hidden="true" />
            </a>
            <a href="#units">
              Units <ArrowDown size={14} aria-hidden="true" />
            </a>
            <a href="#get-connected">
              Get connected <ArrowDown size={14} aria-hidden="true" />
            </a>
            <a href="#questions">
              Your questions <ArrowDown size={14} aria-hidden="true" />
            </a>
          </div>
        </nav>

        <section
          className={`${styles.container} ${styles.fellowships}`}
          id="fellowships"
          aria-labelledby="fellowships-heading"
        >
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>
                <span /> A PLACE TO BELONG
              </span>
              <h2 id="fellowships-heading">
                Different seasons.
                <br />
                <em>The same family.</em>
              </h2>
            </div>
            <p>
              Life brings different questions at every stage. Walk with people
              who will encourage your faith and share the journey.
            </p>
          </div>
          <div className={styles.fellowshipGrid}>
            {fellowships.map((group) => (
              <GroupCard group={group} key={group.id} />
            ))}
            <div className={styles.helpCard}>
              <Sprout size={39} strokeWidth={1.1} aria-hidden="true" />
              <span className={styles.smallLabel}>LET’S FIND YOUR PLACE</span>
              <h3>
                A little unsure?
                <br />
                <em>Start with hello.</em>
              </h3>
              <p>
                You don’t have to figure it out on your own. Tell us a little
                about yourself and we’ll help you take the next step.
              </p>
              <a
                href={enquiry('Help me find a community')}
                className={styles.textLink}
              >
                Talk to our team <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section
          className={styles.serve}
          id="units"
          aria-labelledby="units-heading"
        >
          <div className={`${styles.container} ${styles.serveGrid}`}>
            <div className={styles.serveCopy}>
              <span className={styles.eyebrow}>
                <span /> LOVE IN ACTION
              </span>
              <h2 id="units-heading">
                Your gifts.
                <br />
                <em>A shared purpose.</em>
              </h2>
              <p>
                Sometimes the best way to feel at home is to help someone else
                feel welcome. Bring your gifts and a willing heart, and discover
                the joy of serving together.
              </p>
              <div className={styles.serveNote}>
                <HeartHandshake
                  size={25}
                  strokeWidth={1.3}
                  aria-hidden="true"
                />
                <span>
                  Small acts of service.
                  <br />A love that makes a difference.
                </span>
              </div>
            </div>
            <div className={styles.serveTeams}>
              {units.map((unit) => (
                <article
                  className={styles.serveTeam}
                  id={unit.id}
                  key={unit.id}
                >
                  <HeartHandshake
                    size={27}
                    strokeWidth={1.3}
                    aria-hidden="true"
                  />
                  <div>
                    <span className={styles.smallLabel}>
                      {unit.category}
                    </span>
                    <h3>{unit.title}</h3>
                    <p>{unit.description}</p>
                    {unit.activities.length > 0 && (
                      <ul className={styles.serveActivities}>
                        {unit.activities.map((activity) => (
                          <li key={activity}>
                            <Check size={14} aria-hidden="true" />
                            {activity}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className={styles.cardActions}>
                      <a
                        href={enquiry(`${unit.title} serving enquiry`)}
                        className={styles.textLink}
                        aria-label={`Ask about serving with ${unit.title}`}
                      >
                        Explore serving{' '}
                        <ArrowUpRight size={17} aria-hidden="true" />
                      </a>
                      <Link
                        href={`/gallery/${unit.id}`}
                        className={styles.textLink}
                        aria-label={`View the ${unit.title} gallery`}
                      >
                        View gallery{' '}
                        <ArrowUpRight size={17} aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className={`${styles.container} ${styles.connect}`}
          id="get-connected"
          aria-labelledby="connect-heading"
        >
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>
                <span /> YOUR NEXT STEP
              </span>
              <h2 id="connect-heading">
                It begins with <em>hello.</em>
              </h2>
            </div>
            <a
              href={enquiry('Getting connected at Elim')}
              className={styles.textLink}
            >
              <Mail size={17} aria-hidden="true" /> Get in touch{' '}
              <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          </div>
          <ol className={styles.steps}>
            {steps.map((step, index) => (
              <li key={step.title}>
                <span className={styles.stepNumber}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section
          className={styles.questions}
          id="questions"
          aria-labelledby="questions-heading"
        >
          <div className={`${styles.container} ${styles.questionsGrid}`}>
            <div>
              <span className={styles.eyebrow}>
                <span /> A LITTLE HELP GETTING STARTED
              </span>
              <h2 id="questions-heading">
                Good questions.
                <br />
                <em>A warm welcome.</em>
              </h2>
              <p>
                There’s room for your questions, too. Here are a few things you
                might be wondering.
              </p>
            </div>
            <div className={styles.questionList}>
              {questions.map(({ question, answer }) => (
                <details key={question}>
                  <summary>
                    {question}
                    <Plus size={18} aria-hidden="true" />
                  </summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section
          className={styles.invitation}
          aria-labelledby="invitation-heading"
        >
          <div className={`${styles.container} ${styles.invitationInner}`}>
            <div>
              <span className={styles.eyebrow}>
                <span /> THERE’S A SEAT FOR YOU
              </span>
              <h2 id="invitation-heading">
                Come as you are.
                <br />
                <em>Find a family.</em>
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
                Plan your first visit{' '}
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
              <Link href="/gallery" className={styles.textLink}>
                See our galleries <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}
