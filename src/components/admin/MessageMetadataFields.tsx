'use client'

import type { MessageDetails } from '@/lib/messages'
import styles from './admin.module.css'

export const emptyMessageDetails: MessageDetails = {
  speaker: '', speakerRole: '', series: '', messageDate: '', scripture: '', duration: '',
}

export default function MessageMetadataFields({ value, onChange, prefix }: {
  value: MessageDetails
  onChange: (value: MessageDetails) => void
  prefix: string
}) {
  const fields = [
    { key: 'speaker', label: 'Speaker', max: 120 },
    { key: 'speakerRole', label: 'Speaker role', max: 100 },
    { key: 'series', label: 'Series', max: 120 },
    { key: 'messageDate', label: 'Message date', max: 10 },
    { key: 'scripture', label: 'Bible reference', max: 250 },
    { key: 'duration', label: 'Duration', max: 12 },
  ] as const
  return (
    <>
      {fields.map(({ key, label, max }) => (
        <div key={key}>
          <label htmlFor={`${prefix}-${key}`}>{label} <span>(optional)</span></label>
          <input
            id={`${prefix}-${key}`}
            type={key === 'messageDate' ? 'date' : 'text'}
            min={key === 'messageDate' ? '2000-01-01' : undefined}
            max={key === 'messageDate' ? '2099-12-31' : undefined}
            maxLength={max}
            value={value[key]}
            onChange={(event) => onChange({ ...value, [key]: event.target.value })}
            placeholder={key === 'duration' ? 'minutes:seconds or hours:minutes:seconds' : undefined}
          />
        </div>
      ))}
      <p className={styles.fieldHint}>
        Enter details from this recording. Blank details stay hidden. Without a message date, the upload date is shown.
      </p>
    </>
  )
}
