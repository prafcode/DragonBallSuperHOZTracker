import type { CardSlug, FoundCopy, Sale, Slot } from '../types'
import { getAllFound, latestGrade } from './copies'

export interface SaleRow {
  slot: Slot
  sale: Sale
  /** Grading company from the sale's grade, e.g. "PSA" from "PSA 10"; undefined = raw. */
  company?: string
}

export type Condition = 'all' | 'raw' | 'graded'

/** The main grading companies always get a section, even with zero copies. */
export const MAJOR_COMPANIES = ['PSA', 'CGC', 'BGS'] as const

/** "psa 10" → { company: "PSA", grade: "10" }. Anything without a space counts as a company only. */
export function parseGrade(text?: string): { company: string; grade: string } | undefined {
  if (!text?.trim()) return undefined
  const [company, ...rest] = text.trim().split(/\s+/)
  return { company: company.toUpperCase(), grade: rest.join(' ') }
}

/** Every recorded sale across all five cards, newest first. */
export function allSales(): SaleRow[] {
  return getAllFound()
    .flatMap((slot) =>
      (slot.copy!.sales ?? []).map((sale) => ({ slot, sale, company: parseGrade(sale.grade)?.company })),
    )
    .sort((a, b) => b.sale.date.localeCompare(a.sale.date) || b.sale.price - a.sale.price)
}

export function filterSales(rows: SaleRow[], condition: Condition): SaleRow[] {
  if (condition === 'raw') return rows.filter((r) => !r.company)
  if (condition === 'graded') return rows.filter((r) => r.company)
  return rows
}

/** Most recent raw and graded sale for one card, plus its highest sale ever. */
export function lastSoldFor(slug: CardSlug, rows: SaleRow[]) {
  const mine = rows.filter((r) => r.slot.card.slug === slug)
  return {
    raw: mine.find((r) => !r.company),
    graded: mine.find((r) => r.company),
    top: [...mine].sort((a, b) => b.sale.price - a.sale.price)[0],
    count: mine.length,
  }
}

/** Current slab of a copy: its latest grading record, else the grade on its latest sale. */
export function currentGrade(copy: FoundCopy): { company: string; grade: string } | undefined {
  const g = latestGrade(copy)
  if (g) return { company: g.company.toUpperCase(), grade: g.grade }
  const lastSale = [...(copy.sales ?? [])].sort((a, b) => b.date.localeCompare(a.date))[0]
  return parseGrade(lastSale?.grade)
}

export interface CompanyBreakdown {
  company: string
  copies: number
  /** e.g. [["10", 3], ["9.5", 1]] — highest grade first */
  grades: [string, number][]
}

/** How the found copies split between grading companies, and which grades each gave. */
export function gradingBreakdown(): { companies: CompanyBreakdown[]; raw: number; graded: number } {
  const by = new Map<string, Map<string, number>>()
  for (const c of MAJOR_COMPANIES) by.set(c, new Map())
  let raw = 0
  for (const slot of getAllFound()) {
    const g = currentGrade(slot.copy!)
    if (!g) {
      raw++
      continue
    }
    const grades = by.get(g.company) ?? new Map<string, number>()
    grades.set(g.grade || '?', (grades.get(g.grade || '?') ?? 0) + 1)
    by.set(g.company, grades)
  }
  const companies = [...by.entries()].map(([company, grades]) => ({
    company,
    copies: [...grades.values()].reduce((a, b) => a + b, 0),
    grades: [...grades.entries()].sort((a, b) => Number(b[0]) - Number(a[0])),
  }))
  // Majors first in fixed order, then any others (TAG, SGC, …) by size.
  companies.sort((a, b) => {
    const ia = MAJOR_COMPANIES.indexOf(a.company as never)
    const ib = MAJOR_COMPANIES.indexOf(b.company as never)
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
    return b.copies - a.copies
  })
  const graded = companies.reduce((a, c) => a + c.copies, 0)
  return { companies, raw, graded }
}
