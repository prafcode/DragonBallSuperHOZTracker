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
  "images": ["/images/goku/044.jpg"],
  "sales": [{ "price": 23000, "date": "2025-09-01", "grade": "BGS 10", "url": "https://..." }],
  "grades": [{ "company": "BGS", "grade": "10", "date": "2025-08-20" }],
  "notes": "optional"
}
```

- Dates use the `YYYY-MM-DD` format. Prices are whole US dollars, with no `$` and no commas.
- To log a new sale, add it to that copy's `sales` list. The site always shows the newest one.
- Put photos in `public/images/<card>/` and only use photos you have permission to post.

Commit and push to `main`, and Cloudflare Pages redeploys the site in about a minute.
You can also edit the JSON directly on github.com.

## Deploy (Cloudflare Pages)

1. In the Cloudflare dashboard, go to Workers & Pages → Create → Pages → Connect to Git, and pick this repository.
2. Build settings:
   - Framework preset: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
3. Add the environment variable `NODE_VERSION` = `24`.

`public/_redirects` makes sure that links straight to `/card/...` and `/stats` load the app instead of a 404 page.
