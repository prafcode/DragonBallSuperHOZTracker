import cardsJson from '../data/cards.json'
import goku from '../data/copies/goku.json'
import vegeta from '../data/copies/vegeta.json'
import gohan from '../data/copies/gohan.json'
import broly from '../data/copies/broly.json'
import bardock from '../data/copies/bardock.json'
import type { CardInfo, CardSlug, FoundCopy, Sale, Slot } from '../types'

export const PRINT_RUN = 100

export const CARDS = cardsJson as CardInfo[]

const COPIES: Record<CardSlug, FoundCopy[]> = {
  goku,
  vegeta,
  gohan,
  broly,
  bardock,
} as Record<CardSlug, FoundCopy[]>

export function getCard(slug: string): CardInfo | undefined {
  return CARDS.find((c) => c.slug === slug)
}

/** All 100 slots for a card. Serials missing from the JSON are "not found". */
export function getSlots(slug: CardSlug): Slot[] {
  const card = getCard(slug)!
  const bySerial = new Map(COPIES[slug].map((c) => [c.serial, c]))
  return Array.from({ length: PRINT_RUN }, (_, i) => ({
    card,
    serial: i + 1,
    copy: bySerial.get(i + 1),
  }))
}

/** Every found copy across all five cards. */
export function getAllFound(): Slot[] {
  return CARDS.flatMap((card) =>
    COPIES[card.slug].map((copy) => ({ card, serial: copy.serial, copy })),
  )
}

export function latestSale(copy?: FoundCopy): Sale | undefined {
  if (!copy?.sales?.length) return undefined
  return [...copy.sales].sort((a, b) => b.date.localeCompare(a.date))[0]
}

export function latestGrade(copy?: FoundCopy) {
  if (!copy?.grades?.length) return undefined
  return [...copy.grades].sort((a, b) => b.date.localeCompare(a.date))[0]
}

export function foundCount(slug?: CardSlug): number {
  return slug ? COPIES[slug].length : getAllFound().length
}

export function lastFind(): Slot | undefined {
  return [...getAllFound()].sort((a, b) =>
    b.copy!.foundDate.localeCompare(a.copy!.foundDate),
  )[0]
}

export const pad = (n: number) => String(n).padStart(3, '0')

export const usd = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
