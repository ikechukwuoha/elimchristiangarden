import 'server-only'

// Admin activity lands in the server's structured logs (visible in the
// Vercel dashboard under Deployments → Runtime Logs). No secrets or file
// contents are ever logged — only who-did-what-shape facts.
export function logAdminEvent(
  event: string,
  details: Record<string, unknown> = {},
) {
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      scope: 'admin',
      event,
      ...details,
    }),
  )
}
