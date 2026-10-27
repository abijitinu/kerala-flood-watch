#!/usr/bin/env python3
"""
Fetch today's official dam levels and write data/bulletin.js for the website.

Source: the Kerala State Disaster Management Authority (KSDMA) "Dam Water Level" page,
which republishes the daily KSEB and Irrigation Department reservoir tables as PDFs
(https://sdma.kerala.gov.in/dam-water-level/).

Requires `pdftotext` (poppler: `brew install poppler` / `apt install poppler-utils`).
Run it whenever you want fresh numbers, e.g. every hour from cron:

    python3 scripts/fetch_dams.py
"""
import datetime as dt
import html
import json
import os
import re
import subprocess
import sys
import tempfile
import urllib.parse
import urllib.request

PAGE = "https://sdma.kerala.gov.in/dam-water-level/"
OUT = os.path.join(os.path.dirname(__file__), "..", "data", "bulletin.js")
HISTORY = os.path.join(os.path.dirname(__file__), "..", "data", "history.js")
HISTORY_DAYS = 90
# Fields kept for each dam in the daily archive (enough for the website's past-date view).
HISTORY_FIELDS = ("level", "unit", "levelM", "frl", "blue", "orange", "red", "storagePct", "storageMcm", "capacityMcm", "release", "gates", "alert", "asOf")
UA = {"User-Agent": "Mozilla/5.0 (KeralaFloodWatch data fetcher)"}

# Every dam in both tables is read. These ids are kept stable for dams the site already
# knew (so the daily archive stays continuous); any other dam gets an id from its name.
DAMS = {
    "kakki": "kakki", "pamba": "pamba", "moozhiyar": "moozhiyar", "idukki": "idukki",
    "lower periyar": "lowerperiyar", "idamalayar": "idamalayar",
    "maniyar": "maniyar", "bhoothathankettu": "bhoothathankettu",
}

NUM = re.compile(r"(?<![\w.])(-?\d+(?:\.\d+)?)(\s*%)?(?![\w.])|(?<=\s)(-|N/A)(?=\s|$)")


def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
        return r.read()


def pdf_links(page_html):
    """Find the current KSEB and Irrigation PDF links by their link text."""
    links = {}
    for href, text in re.findall(r'<a[^>]+href="([^"]+\.pdf)"[^>]*>([^<]*)', page_html, re.I):
        text = html.unescape(text)
        if "Water Levels of Major Reservoirs" not in text:
            continue
        kind = "kseb" if "KSEB" in text else "irrigation" if "IRRIGATION" in text.upper() else None
        if kind and kind not in links:
            links[kind] = urllib.parse.urljoin(PAGE, href)
    return links


def pdf_text(data):
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as f:
        f.write(data)
        path = f.name
    try:
        return subprocess.run(["pdftotext", "-layout", path, "-"], capture_output=True, check=True, text=True).stdout
    finally:
        os.unlink(path)


def as_of(text):
    m = re.search(r"(\d{2})/(\d{2})/(\d{4})\s*-\s*(\d{1,2})[.:](\d{2})\s*(AM|PM)", text)
    if not m:
        return None
    d, mo, y, h, mi, ap = m.groups()
    h = int(h) % 12 + (12 if ap == "PM" else 0)
    return dt.datetime(int(y), int(mo), int(d), h, int(mi)).strftime("%Y-%m-%dT%H:%M:00+05:30")


def name_columns(line):
    """Name line -> (dam name, district), e.g. 'Kakki (Anathode)   (Pathanamthitta)'."""
    cols = [c.strip() for c in re.split(r"\s{2,}", line.strip()) if c.strip()]
    clean = lambda c: re.sub(r"^\((.*)\)$", r"\1", c).strip()
    return (clean(cols[0]) if cols else ""), (clean(cols[1]) if len(cols) > 1 else "")


def english_name(line):
    """First column of a name line, e.g. 'Kakki (Anathode)' or '(Pamba)' -> 'kakki (anathode)' / 'pamba'."""
    return name_columns(line)[0].lower()


def dam_id_for(name):
    known = next((v for k, v in DAMS.items() if name.startswith(k)), None)
    if known:
        return known
    base = re.sub(r"\((barrage|regulator|inter state waters)\)", "", name)
    return re.sub(r"[^a-z]+", "", base)


def parse_table(text, kind):
    lines = text.splitlines()
    remarks_x = next((l.find("Remarks") for l in lines if "Remarks" in l), None)
    rows = [i for i, l in enumerate(lines) if re.match(r"^\s{0,6}\d{1,2}\s{3,}\S", l)]
    dams = {}
    for n, i in enumerate(rows):
        row = lines[i]
        # KSEB prints the English name below the numbers; Irrigation prints it above.
        # The name line is the neighbour whose first column is an English name (the other
        # neighbour may hold Malayalam text or the tail of a remark).
        name_line = next((l for l in (lines[i + 1:i + 2] + lines[max(0, i - 1):i]) if re.match(r"\(?[A-Za-z]{3,}", name_columns(l)[0])), "")
        name = english_name(name_line)
        display, district = name_columns(name_line)
        dam_id = dam_id_for(name)
        if not dam_id:
            continue
        # The remark (e.g. "All gates are closed", "5/5 shutters opened @ 450 cm") starts at the
        # first run of text after the number columns; everything before it is readings.
        rm = re.search(r"\s{2,}(?=(?!N/A)[A-Za-z(]|\d+\s*/\s*\d+)", row[20:])
        cut = rm.end() + 20 if rm else (remarks_x - 20 if remarks_x else len(row))
        numbers_part = re.sub(r"^\s*\d{1,2}\s+", " ", row[:cut]) + " "
        tokens = []
        for m in NUM.finditer(numbers_part):
            if m.group(3):
                tokens.append(None)
            else:
                tokens.append((float(m.group(1)), bool(m.group(2))))
        unit = "ft" if re.search(r"\d\s*ft", numbers_part) else "m"
        if len(tokens) < 6:
            print(f"warning: could not read row for {dam_id}: {row.strip()}", file=sys.stderr)
            continue
        val = lambda t: None if t is None else t[0]
        frl, level = val(tokens[0]), val(tokens[1])
        release, pct, current, capacity = val(tokens[-1]), val(tokens[-2]), val(tokens[-3]), val(tokens[-4])
        alerts = [val(t) for t in tokens[2:-4]]
        names = ["rule", "blue", "orange", "red"][-len(alerts):] if alerts else []
        levels = dict(zip(names, alerts))
        # Remarks can sit on the number row or the lines around it.
        prev_row = rows[n - 1] if n else -10
        start = max(prev_row + 2, i - 2)
        # Remarks start after the row's last number (when the row itself has none, they sit on
        # the lines around it, to the right of where its numbers end).
        threshold = cut - 25 if rm else len(row.rstrip()) + 2
        remark_bits = []
        for l in lines[start:i + 2]:
            for seg in re.finditer(r"\S+(?: \S+)*", l):
                if seg.start() >= threshold and re.search(r"[A-Za-z]{2,}", seg.group()):
                    remark_bits.append(seg.group())
        remark = " ".join(remark_bits)
        remark = re.sub(r"\s+", " ", remark).strip()
        to_m = (lambda x: None if x is None else round(x * 0.3048, 2)) if unit == "ft" else (lambda x: x)
        alert = "none"
        for colour in ("blue", "orange", "red"):
            if levels.get(colour) is not None and level is not None and level >= levels[colour]:
                alert = colour
        dams[dam_id] = {
            "name": re.sub(r"\s*\((Inter state waters)\)", "", display), "district": district,
            "kind": "barrage" if re.search(r"barrage|regulator", display, re.I) else "dam",
            "level": level, "unit": unit, "levelM": to_m(level), "frl": frl,
            "ruleLevel": levels.get("rule"), "blue": levels.get("blue"), "orange": levels.get("orange"), "red": levels.get("red"),
            "capacityMcm": capacity, "storageMcm": current,
            "storagePct": round(pct) if pct is not None else None,
            "release": release if release is not None else 0,
            "gates": remark or ("No spillway release" if not release else "Spillway release"),
            "alert": alert, "table": kind,
        }
    return dams


def load_previous():
    """The last bulletin we wrote, or {} if there is none or it can't be read."""
    return read_js_object(OUT)


def read_js_object(path):
    try:
        with open(path) as f:
            s = f.read()
        return json.loads(s[s.index("{"):s.rindex("}") + 1])
    except (OSError, ValueError):
        return {}


def write_js(path, var, data, header):
    tmp = path + ".tmp"
    with open(tmp, "w") as f:
        f.write(header + "\n")
        f.write("window." + var + " = " + json.dumps(data, indent=1) + ";\n")
    os.replace(tmp, path)  # atomic: the website never sees a half-written file


def archive(result):
    """Keep one entry per day (the latest official table of that day), for the last 90 days."""
    if not result.get("asOf"):
        return
    day = result["asOf"][:10]
    history = read_js_object(HISTORY)
    history[day] = {"asOf": result["asOf"], "dams": {k: {f: v.get(f) for f in HISTORY_FIELDS} for k, v in result["dams"].items() if v.get("asOf") == result["asOf"]}}
    for old in sorted(history)[:-HISTORY_DAYS]:
        del history[old]
    write_js(HISTORY, "DAM_HISTORY", history, "// Generated by scripts/fetch_dams.py: one official dam table per day. Do not edit by hand.")


def main():
    page = get(PAGE).decode("utf-8", "replace")
    links = pdf_links(page)
    if not links:
        sys.exit("No dam tables found on " + PAGE)
    result = {"fetchedAt": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"), "sources": links, "dams": {}, "asOf": None}
    stamp = dt.datetime.now().strftime("%Y-%m-%d %H:%M")
    for kind, url in links.items():
        text = pdf_text(get(url))
        result["asOf"] = result["asOf"] or as_of(text)
        found = parse_table(text, kind)
        # A different dam with the same name in the other table (e.g. KSEB and Irrigation
        # both have a "Kuttiyadi") gets its own id.
        found = {(k + "-" + kind if k in result["dams"] else k): v for k, v in found.items()}
        print(f"[{stamp}] {kind}: {len(found)} dams ({', '.join(sorted(found))}) from {url}")
        result["dams"].update(found)
    # Never replace good data with an empty or broken read (site down, PDF layout changed).
    if not result["dams"]:
        sys.exit(f"[{stamp}] No dams could be read; keeping the previous data/bulletin.js")
    for d in result["dams"].values():
        d["asOf"] = result["asOf"]
    # A dam missing from today's tables keeps its last known reading, with that reading's time.
    previous = load_previous()
    for dam_id, old in previous.get("dams", {}).items():
        if dam_id not in result["dams"]:
            old.setdefault("asOf", previous.get("asOf"))
            result["dams"][dam_id] = old
            print(f"[{stamp}] {dam_id}: not in today's tables, keeping reading from {old['asOf']}")
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    write_js(OUT, "LIVE_BULLETIN", result, "// Generated by scripts/fetch_dams.py. Do not edit by hand.")
    archive(result)
    print(f"[{stamp}] wrote", os.path.normpath(OUT), "and the daily archive, as of", result["asOf"])


if __name__ == "__main__":
    main()
