export const church = {
  name: 'Elim Christian Garden International',
  address: 'Elim Garden, Kilometer 2, Kuduru Express Way, Bwari, Abuja',
  email: 'info@elimchristiangarden.org',
  // WhatsApp contact in international format: digits only, no + or spaces.
  whatsapp: '2348035902162',
  // Add the church's public YouTube channel URL when it is available.
  youtubeChannelUrl: '',
  sundayTime: '8:30 AM',
  sundayEnd: '11:30 AM',
  directionsUrl:
    'https://www.google.com/maps/search/?api=1&query=Elim+Christian+Garden+International+Kuduru+Bwari+Abuja',
}

// Opens a WhatsApp chat with the church, with an optional pre-filled message.
export function whatsappLink(message?: string) {
  const base = `https://wa.me/${church.whatsapp}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
