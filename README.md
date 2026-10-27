# Kerala Flood Watch

Flood-risk monitoring and early-warning web app for **every river and dam in Kerala**: 123 named rivers, the 37 dams in the official daily tables (plus Mullaperiyar and the Thottappally and Thanneermukkom outlets), 58 other named dams and 274 river measuring points.

Written for residents, not engineers: readings are turned into everyday words ("about twice the usual water", "Gates closed: holding water") with the raw numbers one tap away.

**Place first.** The home page shows no data, only "Is my area safe?" with a search box, quick towns and "Use where I am now". Choosing a place opens its dashboard (`#place=Aluva&lat=…&lon=…&date=…`, so a link opens the same view):

- **Calendar** – a day strip from 30 days ago to 7 days ahead. Each day has a status dot; past days are recorded data, future days are forecast. Every widget follows the chosen date. The flow chart and rain bars can also be tapped to choose a day.
- **Water near you** – Safe / Be alert / Get ready / Danger for that date, how much water compared with usual for the time of year, the change since the day before, where it was measured (and how far along the river), and how high the land is.
- **River map** – water only, on plain paper with no base map: the real OpenStreetMap lakes, lagoons, river banks, reservoirs and Kuttanad's polders in solid black (`data/water.js`), and the rivers and tributaries as black ribbons (`data/rivers.js`), thicker for more water, with dashes drifting downstream. A stretch gets a coloured edge only when it is above "Safe"; your place is the one magenta accent; cross-hair marks give a surveyor's grid. Dark mode inverts it.
- **Upstream / downstream** – every dam and measuring point the water passes before and after the place, nearest first, with the distance along the river, dam fill, gate state and warning, and each town's status on that date.
- **What to do**, **river water chart** (past month + next week against the usual range) and **rain** (daily bars, past and forecast).
- **Organic Maps** – the dashboard and each map popup link to [Organic Maps](https://organicmaps.app), a free offline OpenStreetMap app, for use when mobile data is down.
- **Guide** – what the colours mean, the emergency bag, do's and don'ts.

Every widget has an eye button with the underlying numbers.

**How "upstream" and "downstream" are worked out:** `js/network.js` turns the OSM river lines into a network (tributaries join their parent river at the nearest vertex) and places each town, dam and measuring point on it. Water at A "flows past" B when B lies on A's path to the sea. A dam more than 3 km from any mapped river (its own river isn't named in OSM) stays off the network and is listed under "Other dams nearby" by straight distance. River systems that don't end at the coast (east-flowing rivers leaving Kerala, or rivers whose lower course OSM doesn't name) say where the map ends instead of giving a distance to the sea.

**Dates and data:** river flow is fetched for the last 30 days and the next 7, with the same season in the previous 7 years so each date is compared with what is usual for that time of year. Rain covers the same days. Dams are only published for today: `scripts/fetch_dams.py` keeps a daily archive in `data/history.js` (90 days), past dates show that day's saved table (or the nearest one within a week), and future dates show the latest official reading.

The map has no base map tiles, so it needs no tile provider.

### Kerala-wide map data

`scripts/build_kerala_data.py <folder>` turns raw downloads into the data files (see the script's header for each input):

| File | Contents |
|---|---|
| `data/rivers.js` | 123 named rivers ≥12 km (Overpass, `area["ISO3166-2"="IN-KL"]`), joined source → mouth |
| `data/dams.js` | `DAM_LOCATIONS` (official-table dams matched to OSM, snapped to a river within 8 km) and `OTHER_DAMS` |
| `data/sites.js` | 274 flow points, one every 20 km along each river, at the GloFAS cell with the most flow |
| `data/places.js` | 3,088 cities, towns and villages for search |
| `data/water.js` | 1,082 lakes, backwaters, reservoirs and river banks (≈615 KB), simplified to ~50 m, areas under 0.04 km² dropped |

The Overpass downloads were made from a browser, because this machine's sandbox couldn't reach Overpass directly.

## Run

No build step. Serve the folder with any static server:

```bash
python3 -m http.server 8765
```

Then open http://localhost:8765.

## Published site

Live at https://abijitinu.github.io/kerala-flood-watch/ (GitHub Pages, from the `main` branch).

`.github/workflows/fetch-dams.yml` runs `scripts/fetch_dams.py` on GitHub every hour (and on demand from the Actions tab). When the official tables change it commits `data/bulletin.js` and `data/history.js`, which redeploys the site. Run `git pull` before changing anything locally, so you start from the latest dam data.

## Data sources

| Data | Source | Status |
|---|---|---|
| River flow, 7-day forecast, 10-year seasonal normal | GloFAS via Open-Meteo Flood API | **Live** |
| Rainfall forecast, ground elevation | Open-Meteo | **Live** |
| Address search | OpenStreetMap Nominatim (offline gazetteer first) | **Live** |
| Dam levels, storage, alert levels, spillway release, gate remarks | Official KSEB & Irrigation daily tables, published by [KSDMA](https://sdma.kerala.gov.in/dam-water-level/) | **Real** – `scripts/fetch_dams.py` → `data/bulletin.js` |
| River gauge levels (CWC) | CWC flood forecasting | **Not connected** – the CWC site wasn't reachable from this machine; towns use the live river forecast instead |

### Refreshing the dam data

```bash
python3 scripts/fetch_dams.py
```

This downloads the latest KSEB and Irrigation PDFs from KSDMA, reads them with `pdftotext` (poppler) and writes `data/bulletin.js`. KSDMA updates the tables daily (usually around 11 AM), so running it hourly is plenty. If `data/bulletin.js` is missing, the site falls back to the sample values in `js/status.js` and says so on the page.

**Automatic hourly refresh.** The GitHub Action described under "Published site" does this. `scripts/com.keralafloodwatch.fetchdams.plist` is an optional macOS LaunchAgent for running the site from your own Mac instead. It is not installed; to use it, fix the paths inside it, copy it to `~/Library/LaunchAgents/` and run:

```bash
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.keralafloodwatch.fetchdams.plist
```

**Last available data.** Nothing is ever blanked out because a source is quiet or down:
- A dam missing from today's tables keeps its previous reading in `data/bulletin.js`, marked with that reading's time.
- If the river forecast can't be fetched, the browser shows the last forecast it saw (saved in `localStorage`).
- Every value shows a timestamp next to it; old values are labelled "Last available".

**Refresh button.** The Refresh button in the top bar re-reads `data/bulletin.js` (bypassing caches), fetches a fresh river forecast, and redraws the whole page in place, including an open location check. When the site is published, the dam data is only as fresh as the copy of `data/bulletin.js` on the server, so the fetch script must run on a schedule wherever the site is hosted.

- Covered: all 37 dams and barrages in the KSEB and Irrigation tables.
- Not in the official tables: Mullaperiyar (Tamil Nadu), Thottappally spillway, Thanneermukkom barrage. These show "No official reading today".
- Dam alert colour is computed from today's level against the declared blue/orange/red levels in the same table.

River distances and elevations are approximate. This app is informational. Official evacuation orders always take priority.
