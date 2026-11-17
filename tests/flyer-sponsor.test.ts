import assert from 'node:assert/strict'
import { test } from 'node:test'
import { flyerSponsor } from '../src/app/worship-encounter/flyer-sponsor'

test('an omitted or whitespace-only affiliation does not add sponsorship', () => {
  assert.equal(flyerSponsor(''), '')
  assert.equal(flyerSponsor('  \n\t '), '')
})

test('Tehilla is presented as a ministry regardless of casing or an existing suffix', () => {
  for (const value of ['Tehilla', '  tEhIlLa  ', 'Tehilla Ministries', 'tehilla ministry']) {
    assert.equal(flyerSponsor(value), 'Sponsored By Tehilla Ministries')
  }
})

test('the four named fellowships use Fellowship rather than Unit', () => {
  for (const name of ['Brothers', 'Couples', 'Sisters', 'Singles']) {
    assert.equal(flyerSponsor(name), `Sponsored By ${name} Fellowship`)
    assert.equal(flyerSponsor(` ${name.toLowerCase()} fellowship `), `Sponsored By ${name} Fellowship`)
  }
})

test('other affiliations are units without duplicated suffixes', () => {
  assert.equal(flyerSponsor('Media'), 'Sponsored By Media Unit')
  assert.equal(flyerSponsor(' media unit '), 'Sponsored By Media Unit')
  assert.equal(flyerSponsor('  technical   team '), 'Sponsored By Technical Team Unit')
  assert.equal(flyerSponsor('ICT'), 'Sponsored By ICT Unit')
})
