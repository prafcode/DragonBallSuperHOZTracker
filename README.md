# HOZ Tracker

A tracker for the serial-numbered /100 cards in **Dragon Ball Super Card Game Masters: History of Z (BT27)**.
There are 5 cards with 100 copies each, so 500 copies in all:

| Card | Number |
|---|---|
| Son Goku, Unlimited Potential | BT27-019 |
| SSB Vegeta, Power of Conviction | BT27-039 |
| SS2 Son Gohan, Sadness and Rage | BT27-059 |
| SS Broly, Vigor | BT27-084 |
| Bardock, Destiny-Changing Willpower | BT27-095 |

It's built with Vite, React, TypeScript and Tailwind, and is hosted on Cloudflare Pages.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs to dist/
```

## Add a find or a sale

All the data lives in `src/data/copies/<card>.json` (`goku`, `vegeta`, `gohan`, `broly`, `bardock`).
**Only copies that have been found go in these files.** Any serial number from 1 to 100 that isn't listed shows as "Not found".

```json
{
  "serial": 44,
  "foundBy": "Name or shop",
  "foundDate": "2025-08-02",
  "source": "https://link-to-proof",
  "sales": [{ "price": 23000, "date": "2025-09-01", "grade": "BGS 10", "url": "https://..." }],
  "grades": [{ "company": "BGS", "grade": "10", "date": "2025-08-20" }],
  "notes": "optional"
}
```

- Dates use the `YYYY-MM-DD` format. Prices are whole US dollars, with no `$` and no commas.
- To log a new sale, add it to that copy's `sales` list. The site always shows the newest one.

Commit and push to `main`, and Cloudflare redeploys the site in about a minute.
You can also edit the JSON directly on github.com.

## Add photos

Photos are matched to a copy **by file name**, so you don't need to edit the JSON:

```
src/photos/<card>/<serial>-<n>.jpg

src/photos/goku/044-1.jpg   ← cover photo for Goku #044
src/photos/goku/044-2.jpg   ← second photo (back, slab, etc.)
```

- `<card>` is one of `goku`, `vegeta`, `gohan`, `broly` or `bardock`.
- `<serial>` is the copy number. Leading zeros are optional, so `44-1.jpg` works too.
- `<n>` sets the order. `1` is the cover shown in the binder.
- Accepted formats: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`, `.svg`.
- Photos only show for copies listed in the JSON, so add the find first.
- Keep files under about 1 MB. Around 1200 px tall is plenty.
- Only post photos you took yourself or have permission to use.

**On github.com:** open `src/photos/<card>/`, click **Add file → Upload files**, drag in the renamed photos, then **Commit changes**.
The photos are live after the next deploy.

You can also put a full external image address in a copy's `"images"` list in the JSON. Those show after any uploaded photos.

`src/photos/goku/044-1.svg` and `044-2.svg` are placeholder samples. Delete them once you have real photos.

## Deploy (Cloudflare Workers, free plan)

The site is connected through Workers & Pages → Create → Import a repository. It uses these settings:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`

The deploy uses `wrangler.jsonc`, which uploads `dist/` as static files. Its
`not_found_handling: "single-page-application"` setting makes links straight to `/card/...` and `/stats` load the app instead of a 404 page.
The `name` in `wrangler.jsonc` has to match the project name in Cloudflare.
