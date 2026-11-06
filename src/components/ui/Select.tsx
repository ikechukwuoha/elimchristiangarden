'use client'

import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown, Leaf } from 'lucide-react'
import styles from './select.module.css'

export type SelectOption = { value: string; label: string; description?: string; disabled?: boolean }
type Placement = { style: CSSProperties; side: 'top' | 'bottom' }
type SelectProps = {
  id: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  placeholder?: string
  menuLabel?: string
  disabled?: boolean
  required?: boolean
  name?: string
  size?: 'regular' | 'compact'
  className?: string
  'aria-label'?: string
  'aria-describedby'?: string
}

export default function Select({
  id, value, options, onChange, placeholder = 'Choose an option', menuLabel = 'Make your selection',
  disabled = false, required = false, name, size = 'regular', className = '',
  'aria-label': ariaLabel, 'aria-describedby': describedBy,
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const [invalid, setInvalid] = useState(false)
  const [placement, setPlacement] = useState<Placement | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const typeahead = useRef({ text: '', time: 0 })
  const uniqueId = useId()
  const listboxId = `${uniqueId}-list`
  const errorId = `${uniqueId}-error`
  const selected = options.find((option) => option.value === value)
  const expanded = open && !disabled && options.length > 0
  const activeIndex = Math.max(0, Math.min(highlighted, options.length - 1))
  const hasError = invalid && required && !selected?.value

  function isDisabled() {
    // Includes a surrounding disabled fieldset, not just the disabled prop.
    return !triggerRef.current || triggerRef.current.matches(':disabled')
  }

  function measure(): Placement | null {
    const trigger = triggerRef.current
    if (!trigger) return null
    const rect = trigger.getBoundingClientRect()
    const width = Math.min(Math.max(rect.width, 248), window.innerWidth - 24)
    const below = window.innerHeight - rect.bottom - 20
    const above = rect.top - 20
    const side = below >= Math.min(320, above) ? 'bottom' : 'top'
    return {
      side,
      style: {
        width,
        left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)),
        maxHeight: Math.max(0, Math.min(350, side === 'bottom' ? below : above)),
        ...(side === 'bottom' ? { top: rect.bottom + 8 } : { bottom: window.innerHeight - rect.top + 8 }),
      },
    }
  }

  function openList(index?: number) {
    if (isDisabled() || options.length === 0) return
    const current = options.findIndex((option) => option.value === value && !option.disabled)
    const first = options.findIndex((option) => !option.disabled)
    setHighlighted(index ?? (current >= 0 ? current : Math.max(0, first)))
    setPlacement(measure())
    typeahead.current = { text: '', time: 0 }
    setOpen(true)
  }

  function choose(index: number, focus = true) {
    const option = options[index]
    if (isDisabled() || !option || option.disabled) return
    setOpen(false)
    setInvalid(false)
    onChange(option.value)
    if (focus) triggerRef.current?.focus({ preventScroll: true })
  }

  useEffect(() => {
    if (!open) return
    let frame = 0
    function reposition(event?: Event) {
      if (event?.target instanceof Node && panelRef.current?.contains(event.target)) return
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const rect = triggerRef.current?.getBoundingClientRect()
        if (!rect || rect.bottom < 12 || rect.top > window.innerHeight - 12) setOpen(false)
        else setPlacement(measure())
      })
    }
    function outside(event: PointerEvent) {
      if (event.target instanceof Node && !triggerRef.current?.contains(event.target) && !panelRef.current?.contains(event.target)) setOpen(false)
    }
    const disabledObserver = new MutationObserver(() => {
      if (triggerRef.current?.matches(':disabled')) setOpen(false)
    })
    const trigger = triggerRef.current
    if (trigger) {
      disabledObserver.observe(trigger, { attributes: true, attributeFilter: ['disabled'] })
      for (let parent = trigger.parentElement; parent; parent = parent.parentElement) {
        if (parent.tagName === 'FIELDSET') disabledObserver.observe(parent, { attributes: true, attributeFilter: ['disabled'] })
      }
    }
    const resizeObserver = new ResizeObserver(() => reposition())
    if (trigger) resizeObserver.observe(trigger)
    window.addEventListener('resize', reposition)
    window.addEventListener('scroll', reposition, true)
    document.addEventListener('pointerdown', outside)
    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      disabledObserver.disconnect()
      window.removeEventListener('resize', reposition)
      window.removeEventListener('scroll', reposition, true)
      document.removeEventListener('pointerdown', outside)
    }
  }, [open])

  useEffect(() => {
    if (!expanded) return
    const list = listRef.current
    const option = list?.children[activeIndex] as HTMLElement | undefined
    if (!list || !option) return
    if (option.offsetTop < list.scrollTop) list.scrollTop = option.offsetTop
    else if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight
    }
  }, [expanded, activeIndex, options.length])

  function nextEnabled(start: number, direction: number) {
    for (let index = start; index >= 0 && index < options.length; index += direction) {
      if (!options[index].disabled) return index
    }
    return activeIndex
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (isDisabled()) return
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (expanded) choose(activeIndex)
        else openList()
        return
      case 'Escape':
        if (expanded) { event.preventDefault(); event.stopPropagation(); setOpen(false) }
        return
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault()
        const direction = event.key === 'ArrowDown' ? 1 : -1
        if (expanded) setHighlighted(nextEnabled(activeIndex + direction, direction))
        else openList()
        return
      }
      case 'Home':
      case 'End': {
        event.preventDefault()
        const index = event.key === 'Home' ? nextEnabled(0, 1) : nextEnabled(options.length - 1, -1)
        if (expanded) setHighlighted(index)
        else openList(index)
        return
      }
      case 'Tab':
        if (expanded) choose(activeIndex, false)
        return
    }
    if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return
    event.preventDefault()
    const now = Date.now()
    const text = (now - typeahead.current.time < 700 ? typeahead.current.text : '') + event.key.toLocaleLowerCase()
    const search = Array.from(text).every((character) => character === text[0]) ? text[0] : text
    const normalize = (label: string) => label.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase()
    const start = expanded ? activeIndex : options.findIndex((option) => option.value === value)
    const match = options.map((_, offset) => (start + offset + 1 + options.length) % options.length)
      .find((index) => !options[index].disabled && normalize(options[index].label).startsWith(normalize(search)))
    if (match !== undefined) {
      if (expanded) setHighlighted(match)
      else openList(match)
    }
    typeahead.current = { text, time: now }
  }

  return (
    <div className={`${styles.root} ${size === 'compact' ? styles.compact : ''} ${className}`}>
      <button ref={triggerRef} type="button" id={id} role="combobox"
        className={styles.trigger} data-placeholder={!selected || undefined}
        disabled={disabled || options.length === 0}
        aria-label={ariaLabel} aria-required={required || undefined} aria-invalid={hasError || undefined}
        aria-describedby={[describedBy, hasError ? errorId : ''].filter(Boolean).join(' ') || undefined}
        aria-controls={expanded ? listboxId : undefined} aria-expanded={expanded} aria-haspopup="listbox"
        aria-activedescendant={expanded ? `${listboxId}-${activeIndex}` : undefined}
        onClick={() => expanded ? setOpen(false) : openList()} onKeyDown={onKeyDown}
        onBlur={(event) => { if (!panelRef.current?.contains(event.relatedTarget)) setOpen(false) }}>
        <span className={styles.value}>{selected?.label ?? placeholder}</span>
        <span className={styles.chevron}><ChevronDown size={16} strokeWidth={1.6} aria-hidden="true" /></span>
      </button>
      {/* Preserve form validation/submission without opening a native menu. */}
      <select className={styles.formControl} tabIndex={-1} aria-hidden="true" name={name ?? id}
        value={value} required={required} disabled={disabled || options.length === 0}
        onChange={(event) => { onChange(event.target.value); setInvalid(false) }}
        onInvalid={(event) => {
          event.preventDefault()
          setInvalid(true)
          if (event.currentTarget.form?.querySelector('input:invalid, select:invalid, textarea:invalid') === event.currentTarget) {
            triggerRef.current?.scrollIntoView({ block: 'center', behavior: 'instant' })
            triggerRef.current?.focus({ preventScroll: true })
            openList()
          }
        }}>
        {!options.some((option) => option.value === '') && <option value="">{placeholder}</option>}
        {options.map((option) => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}
      </select>
      {hasError && <p id={errorId} className={styles.error}>Please choose an option.</p>}
      {expanded && placement && createPortal(
        <div ref={panelRef} className={styles.panel} style={placement.style} data-side={placement.side}
          onPointerDown={(event) => { if (event.pointerType === 'mouse') event.preventDefault() }}>
          <div className={styles.menuHeading} aria-hidden="true">
            <span className={styles.leaf}><Leaf size={15} strokeWidth={1.5} /></span>
            <span>{menuLabel}</span><span className={styles.count}>{String(options.length).padStart(2, '0')}</span>
          </div>
          <ul ref={listRef} id={listboxId} role="listbox" aria-label={ariaLabel ?? menuLabel} className={styles.list}>
            {options.map((option, index) => <li id={`${listboxId}-${index}`} key={option.value} role="option"
              aria-selected={option.value === value} aria-disabled={option.disabled || undefined}
              aria-label={option.label} aria-describedby={option.description ? `${listboxId}-${index}-description` : undefined}
              className={styles.option} data-highlighted={index === activeIndex || undefined}
              onPointerMove={(event) => { if (event.pointerType === 'mouse' && !option.disabled) setHighlighted(index) }}
              onClick={() => choose(index)}>
              <span className={styles.optionCopy}><span>{option.label}</span>{option.description && <small id={`${listboxId}-${index}-description`}>{option.description}</small>}</span>
              <span className={styles.check} aria-hidden="true">{option.value === value && <Check size={14} strokeWidth={2} />}</span>
            </li>)}
          </ul>
        </div>, document.body,
      )}
    </div>
  )
}
