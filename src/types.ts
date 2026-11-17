export type CardSlug = 'goku' | 'vegeta' | 'gohan' | 'broly' | 'bardock'

export interface CardInfo {
  slug: CardSlug
  number: string // e.g. "BT27-019"
  name: string
  character: string
  accent: string // hex colour used for glows, bars, tabs
  image?: string // optional art in /public/images
}

export interface Sale {
  price: number // USD
  date: string // YYYY-MM-DD
  grade?: string // e.g. "PSA 10" — omit if raw
  url?: string
}

export interface Grade {
  company: string // PSA | BGS | CGC | TAG | ...
  grade: string // "10", "9.5", ...
  date: string
}

/** One entry in data/copies/<slug>.json — only copies that have surfaced. */
export interface FoundCopy {
  serial: number // 1..100
  foundBy: string
  foundDate: string
  source?: string
  images?: string[]
  sales?: Sale[]
  grades?: Grade[]
  notes?: string
}

/** One of the 100 slots for a card; `copy` is undefined when not found. */
export interface Slot {
  card: CardInfo
  serial: number
  copy?: FoundCopy
}
