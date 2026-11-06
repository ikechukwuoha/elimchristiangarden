import { CalendarDays, Clock3, MapPin } from 'lucide-react'
import type { ChurchEvent } from '@/lib/events'
import { eventDetails } from '@/lib/event-details'
import styles from './birthdays.module.css'

export default function ProgrammeCardContent({ programme, today }: { programme: ChurchEvent; today: string }) {
  const { title, theme, texts } = eventDetails(programme)
  const date = new Date(`${programme.date}T00:00:00Z`)
  const format = (options: Intl.DateTimeFormatOptions) => date.toLocaleDateString('en-GB', { ...options, timeZone: 'UTC' })
  return <div className={styles.programmeContent}>
    <span className={styles.programmeEyebrow}><span /> UPCOMING PROGRAMME</span>
    <div className={styles.programmeDateRow}>
      <div className={styles.programmeDateTile}>
        <span>{format({ month: 'short' })}</span>
        <strong>{date.getUTCDate()}</strong>
        <span>{date.getUTCFullYear()}</span>
      </div>
      <div className={styles.programmeDay}>
        <CalendarDays size={22} strokeWidth={1.2} aria-hidden="true" />
        <strong>{format({ weekday: 'long' })}</strong>
        <span>{programme.date === today ? 'HAPPENING TODAY' : 'YOU’RE INVITED'}</span>
      </div>
    </div>
    <h2 className={styles.programmeTitle}>{title}</h2>
    {theme && <div className={styles.programmeTheme}>
      <span>THEME</span>
      <p>{theme}</p>
    </div>}
    {texts.length > 0 && <div className={styles.programmeScriptures}>
      <span>BIBLE PASSAGES</span>
      <ul className={styles.programmeTexts} aria-label="Bible passages">
        {texts.map((text, index) => <li key={`${index}-${text}`}>{text}</li>)}
      </ul>
    </div>}
    {(programme.time || programme.location) && <div className={styles.programmeDetails}>
      {programme.time && <div><Clock3 size={17} strokeWidth={1.5} aria-hidden="true" /><span><small>TIME</small>{programme.time}</span></div>}
      {programme.location && <div><MapPin size={17} strokeWidth={1.5} aria-hidden="true" /><span><small>VENUE</small>{programme.location}</span></div>}
    </div>}
    <p className={styles.programmeInvitation}>Let’s make room to gather, grow, and share life together.</p>
  </div>
}
