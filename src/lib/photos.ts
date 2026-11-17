/**
 * Photos are found by file name, so uploading one is just adding a file:
 *
 *   src/photos/<card>/<serial>-<n>.<ext>     e.g. src/photos/goku/044-1.jpg
 *
 * <serial> is 1–100 (leading zeros optional), <n> orders the gallery (1 = cover).
 * Vite bundles every match at build time and gives each a hashed, cacheable URL.
 */
const files = import.meta.glob('../photos/*/*.{jpg,jpeg,png,webp,avif,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const NAME = /\/photos\/([a-z]+)\/0*(\d{1,3})-(\d+)\.\w+$/i

const bySlot = new Map<string, { order: number; url: string }[]>()
for (const [path, url] of Object.entries(files)) {
  const m = NAME.exec(path)
  if (!m) {
    console.warn(`[photos] Skipping ${path}: name it <serial>-<n>.jpg, e.g. 044-1.jpg`)
    continue
  }
  const key = `${m[1].toLowerCase()}-${Number(m[2])}`
  const list = bySlot.get(key) ?? []
  list.push({ order: Number(m[3]), url })
  bySlot.set(key, list)
}

/** Uploaded photos for one copy, cover first. */
export function photosFor(slug: string, serial: number): string[] {
  return (bySlot.get(`${slug}-${serial}`) ?? []).sort((a, b) => a.order - b.order).map((p) => p.url)
}
