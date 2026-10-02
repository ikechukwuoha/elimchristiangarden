// Generates a base32 secret for the admin TOTP second factor.
// Run: npm run admin:totp
// Then add the secret to an authenticator app (Google Authenticator, Authy,
// 1Password…) via “Enter a setup key”, and set ADMIN_TOTP_SECRET in your
// environment to the secret printed below.
import { randomBytes } from 'node:crypto'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

function base32Encode(buffer) {
  let bits = 0
  let value = 0
  let output = ''
  for (const byte of buffer) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      output += ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) output += ALPHABET[(value << (5 - bits)) & 31]
  return output
}

const secret = base32Encode(randomBytes(20))
const label = encodeURIComponent('Elim Media Admin')
const issuer = encodeURIComponent('Elim Christian Garden')

console.log('Admin two-factor setup')
console.log('======================')
console.log('')
console.log('1. Add this secret to your authenticator app (“Enter a setup key”):')
console.log('')
console.log(`   ${secret}`)
console.log('')
console.log('2. Or scan/paste this URI where a QR code is expected:')
console.log('')
console.log(
  `   otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`,
)
console.log('')
console.log('3. Set it in .env.local and on your hosting platform:')
console.log('')
console.log(`   ADMIN_TOTP_SECRET=${secret}`)
console.log('')
console.log('   Changing or removing ADMIN_TOTP_SECRET (or the password) signs')
console.log('   every admin out immediately.')
