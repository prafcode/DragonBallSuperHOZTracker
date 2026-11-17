import type { Slot } from '../types'
import { latestSale } from './copies'

export type FoundFilter = 'all' | 'found' | 'notfound'
export type SortKey = 'serial-asc' | 'serial-desc' | 'price-desc' | 'price-asc' | 'date-desc' | 'date-asc'

export const SORT_LABELS: Record<SortKey, string> = {
  'serial-asc': 'Serial (1 → 100)',
  'serial-desc': 'Serial (100 → 1)',
  'price-desc': 'Price (high → low)',
  'price-asc': 'Price (low → high)',
  'date-desc': 'Found (newest)',
  'date-asc': 'Found (oldest)',
}

const priceOf = (s: Slot) => latestSale(s.copy)?.price

/**
 * Compare two slots by their latest sale price.
 * `dir` is 1 for low → high and -1 for high → low.
 */
function comparePrice(a: Slot, b: Slot, dir: 1 | -1): number {
  const pa = priceOf(a)
  const pb = priceOf(b)
  // TODO(human): decide where slots without a price go, then compare prices.
  void pa; void pb; void dir
  return 0
}

/** Undated (not found) slots always go last when sorting by date. */
function compareDate(a: Slot, b: Slot, dir: 1 | -1): number {
  const da = a.copy?.foundDate
  const db = b.copy?.foundDate
  if (!da && !db) return 0
  if (!da) return 1
  if (!db) return -1
  return da.localeCompare(db) * dir
}

export function applyView(
  slots: Slot[],
  opts: { filter: FoundFilter; sort: SortKey; search: string },
): Slot[] {
  const q = opts.search.replace(/[^0-9]/g, '')
  let out = slots.filter((s) => {
    if (opts.filter === 'found' && !s.copy) return false
    if (opts.filter === 'notfound' && s.copy) return false
    if (q && !String(s.serial).includes(String(Number(q)))) return false
    return true
  })
  out = [...out].sort((a, b) => {
    switch (opts.sort) {
      case 'serial-desc': return b.serial - a.serial
      case 'price-desc': return comparePrice(a, b, -1) || a.serial - b.serial
      case 'price-asc': return comparePrice(a, b, 1) || a.serial - b.serial
      case 'date-desc': return compareDate(a, b, -1) || a.serial - b.serial
      case 'date-asc': return compareDate(a, b, 1) || a.serial - b.serial
      default: return a.serial - b.serial
    }
  })
  return out
}
