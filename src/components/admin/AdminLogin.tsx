'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, LockKeyhole } from 'lucide-react'
import styles from './admin.module.css'

export default function AdminLogin({
  configured,
  twoFactorEnabled,
}: {
  configured: boolean
  twoFactorEnabled: boolean
}) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setError('')
    setBusy(true)
    try {
      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: data.get('password'),
          code: data.get('code') ?? '',
        }),
      })
      const result = await response.json()
      if (!response.ok)
        throw new Error(result.error || 'Sign-in failed. Please try again.')
      router.refresh()
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'We couldn’t sign you in. Check your connection and try again.',
      )
      setBusy(false)
    }
  }

  return (
    <section className={styles.login} aria-labelledby="signin-heading">
      <span className={styles.iconCircle}>
        <LockKeyhole size={25} strokeWidth={1.4} aria-hidden="true" />
      </span>
      <h2 id="signin-heading">Welcome back.</h2>
      <p>Enter the team password to manage your media.</p>
      {configured ? (
        <form onSubmit={signIn}>
          <label htmlFor="admin-password">Admin password</label>
          <input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            maxLength={256}
            disabled={busy}
            aria-describedby={error ? 'login-error' : undefined}
          />
          {twoFactorEnabled && (
            <>
              <label htmlFor="admin-code" style={{ marginTop: 20 }}>
                Authentication code
              </label>
              <input
                id="admin-code"
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={10}
                disabled={busy}
                placeholder="6-digit code"
              />
              <p className={styles.fieldHint}>
                Open your authenticator app and enter the current code.
              </p>
            </>
          )}
          {error && (
            <p className={styles.error} id="login-error" role="alert">
              {error}
            </p>
          )}
          <button
            className={styles.primaryButton}
            disabled={busy}
            type="submit"
          >
            {busy ? 'Signing in…' : 'Enter the media room'}{' '}
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        </form>
      ) : (
        <p className={styles.notice} role="status">
          Admin access hasn’t been configured yet. Contact the site
          administrator to finish setup.
        </p>
      )}
    </section>
  )
}
