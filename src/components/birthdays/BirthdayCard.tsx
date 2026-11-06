'use client'

import Image from 'next/image'
import { Heart, Leaf } from 'lucide-react'
import { anniversaryBlessing, birthdayBlessing, celebrationKind, type Birthday } from '@/lib/birthdays'
import PopupCard, { type PopupControls } from './PopupCard'
import styles from './birthdays.module.css'

export default function BirthdayCard({
  birthdays, index, monthLabel, today, ...controls
}: Omit<PopupControls, 'count'> & { birthdays: Birthday[]; monthLabel: string; today?: number }) {
  const birthday = birthdays[index] ?? birthdays[0]
  if (!birthday) return null
  return <PopupCard {...controls} index={index} count={birthdays.length}
    variant={celebrationKind(birthday)} slideKey={`celebration:${birthday.id}`}>
    <CelebrationContent birthday={birthday} monthLabel={monthLabel} today={today} />
  </PopupCard>
}

export function CelebrationContent({ birthday, monthLabel, today }: { birthday: Birthday; monthLabel: string; today?: number }) {
  if (celebrationKind(birthday) === 'anniversary') return <AnniversaryContent celebration={birthday} monthLabel={monthLabel} today={today} />
  return <>
    <div className={styles.intro}>
      <p>A little joy. A lot of love.</p>
      <h2>Celebrating <em>you.</em></h2>
      <span>{monthLabel} · Birthday</span>
    </div>
    <div className={styles.portrait}>
      <Image src={birthday.photoUrl} alt={`Portrait of ${birthday.name}`} fill unoptimized sizes="180px" />
      <span className={styles.portraitLeaf}><Leaf size={20} strokeWidth={1.3} aria-hidden="true" /></span>
      <span className={styles.date}>{birthday.day === today ? 'Today · ' : ''}{birthday.day} {monthLabel}</span>
    </div>
    <div className={styles.copy}>
      <p className={styles.celebrate}>HAPPY BIRTHDAY</p>
      <h3>{birthday.name}</h3>
      <p className={styles.blessing}>{birthday.message || birthdayBlessing}</p>
    </div>
  </>
}

function AnniversaryContent({ celebration, monthLabel, today }: { celebration: Birthday; monthLabel: string; today?: number }) {
  return <>
    <div className={styles.anniversaryIntro}>
      <span className={styles.rings} aria-hidden="true"><span /><span /></span>
      <p>A JOURNEY BLESSED BY GRACE</p>
      <h2>Happy <em>Anniversary.</em></h2>
    </div>
    <div className={styles.anniversaryPhoto}>
      <Image src={celebration.photoUrl} alt={`Anniversary photograph of ${celebration.name}`} fill unoptimized sizes="310px" />
      <span className={styles.anniversaryDate}><Heart size={12} strokeWidth={1.5} aria-hidden="true" />{celebration.day === today ? 'Celebrating today' : `${celebration.day} ${monthLabel}`}</span>
    </div>
    <div className={styles.anniversaryCopy}>
      <p className={styles.anniversaryLabel}>WITH LOVE, WE CELEBRATE</p>
      <h3>{celebration.name}</h3>
      <span className={styles.anniversaryRule} aria-hidden="true" />
      <p className={styles.anniversaryBlessing}>{celebration.message || anniversaryBlessing}</p>
    </div>
  </>
}
