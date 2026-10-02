'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import styles from './admin.module.css'

export type SelectOption = { value: string; label: string }

// A styled dropdown that behaves like a native select (keyboard, focus, outside
// click) but matches the rest of the admin forms.
export default function Select({
  id,
  value,
  options,
  onChange,
  placeholder,
  disabled,
}: {
  id: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const listboxId = useId()

  useEffect(() => {
    if (!open) return
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [open])

  useEffect(() => {
    if (!open) return
    listRef.current
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ block: 'nearest' })
  }, [open])

  const selected = options.find((option) => option.value === value)

  function openList() {
    const current = options.findIndex((option) => option.value === value)
    setHighlighted(current === -1 ? 0 : current)
    setOpen(true)
  }

  function choose(option: SelectOption) {
    onChange(option.value)
    setOpen(false)
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (disabled) return
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (open && options[highlighted]) choose(options[highlighted])
        else openList()
        break
      case 'Escape':
        setOpen(false)
        break
      case 'ArrowDown':
        event.preventDefault()
        if (open)
          setHighlighted((index) => Math.min(options.length - 1, index + 1))
        else openList()
        break
      case 'ArrowUp':
        event.preventDefault()
        if (open) setHighlighted((index) => Math.max(0, index - 1))
        else openList()
        break
      case 'Tab':
        setOpen(false)
        break
    }
  }

  return (
    <div className={styles.select} ref={rootRef} onKeyDown={onKeyDown}>
      <button
        type="button"
        id={id}
        role="combobox"
        aria-controls={open ? listboxId : undefined}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={styles.selectButton}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openList())}
      >
        <span className={selected ? undefined : styles.selectPlaceholder}>
          {selected?.label ?? placeholder ?? 'Choose…'}
        </span>
        <ChevronDown
          size={17}
          aria-hidden="true"
          className={`${styles.selectChevron} ${open ? styles.selectChevronOpen : ''}`}
        />
      </button>
      {open && (
        <ul
          className={styles.selectList}
          role="listbox"
          id={listboxId}
          aria-label={placeholder}
          ref={listRef}
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              className={`${styles.selectOption} ${index === highlighted ? styles.selectOptionActive : ''}`}
              onPointerMove={() => setHighlighted(index)}
              onClick={() => choose(option)}
            >
              <span>{option.label}</span>
              {option.value === value && (
                <Check size={15} aria-hidden="true" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
