#!/usr/bin/env python3
"""
Build the "day in the life" demo data from the American Time Use Survey (ATUS).

ATUS (U.S. Bureau of Labor Statistics, public domain) asks thousands of people to
describe one day, 4am to 4am, activity by activity, with start times. This script
turns one year of it into a small JSON file the demo can replay:

  - each person is put in a group from their diary day and survey answers
    (day-shift worker, night-shift worker, student, homemaker, retiree, ...)
  - their activities are mapped onto the demo's circle of activities
  - people are sampled using the survey weights, so samples are representative

Usage:
  python3 scripts/build-timeuse.py data-raw 2019 src/demo/timeuse/atus-2019.json

`data-raw` must hold atusact-YEAR.zip, atusresp-YEAR.zip and atusrost-YEAR.zip, as
published at https://www.bls.gov/tus/data.htm (download them in a browser).
Standard library only.
"""

import csv
import io
import json
import random
import sys
import zipfile
from collections import defaultdict

DAY_START_MIN = 4 * 60  # ATUS diary days run 4:00am to 4:00am

# The circle, in the order a day tends to go round it. Travel sits in the middle.
ACTIVITIES = [
    ("sleep", "Sleeping"),
    ("ready", "Getting ready"),
    ("breakfast", "Breakfast"),
    ("work", "Work"),
    ("school", "School & study"),
    ("lunch", "Lunch"),
    ("care", "Caring for others"),
    ("house", "Housework & cooking"),
    ("errands", "Shopping & errands"),
    ("exercise", "Exercise & sports"),
    ("dinner", "Dinner"),
    ("social", "Socializing"),
    ("out", "Going out"),
    ("faith", "Faith & volunteering"),
    ("relax", "TV & relaxing"),
    ("travel", "Commuting & travel"),
]
ACT_INDEX = {key: i for i, (key, _) in enumerate(ACTIVITIES)}

# Who people are on their diary day. Shapes/colours are chosen in the app.
GROUPS = [
    ("day", "Day-shift worker"),
    ("night", "Night-shift worker"),
    ("student", "Student"),
    ("home", "Homemaker or not employed"),
    ("retired", "Retiree (65+)"),
    ("off", "Employed, off work today"),
    ("other", "Other"),
]

# The data sets offered in the demo's picker.
DATASETS = [
    {"key": "weekday", "label": "Everyone, on a weekday", "days": "weekday", "groups": None, "sample": 400},
    {"key": "weekend", "label": "Everyone, on a weekend", "days": "weekend", "groups": None, "sample": 400},
    {"key": "day", "label": "Day-shift workers", "days": "weekday", "groups": ["day"], "sample": 260},
    {"key": "night", "label": "Night-shift workers", "days": "any", "groups": ["night"], "sample": 260},
    {"key": "student", "label": "Students", "days": "weekday", "groups": ["student"], "sample": 260},
    {"key": "home", "label": "Homemakers and not employed", "days": "weekday", "groups": ["home"], "sample": 260},
    {"key": "retired", "label": "Retirees", "days": "weekday", "groups": ["retired"], "sample": 260},
]

MIN_WORK_MINUTES = 4 * 60  # counts as a work day
NIGHT_SHARE = 0.5  # share of work minutes between 8pm and 6am that makes it a night shift


def read_csv(zip_path, member_suffix):
    with zipfile.ZipFile(zip_path) as z:
        name = next(n for n in z.namelist() if n.endswith(member_suffix))
        with z.open(name) as f:
            yield from csv.DictReader(io.TextIOWrapper(f, encoding="ascii", newline=""))


def clock_minutes(hhmmss):
    h, m, _ = hhmmss.split(":")
    return int(h) * 60 + int(m)


def category(code, clock):
    """Map a 6-digit ATUS activity code (and its start time, for meals) onto the circle."""
    t1, t2 = code[:2], code[:4]
    if t2 == "0101":
        return "sleep"
    if t1 == "01":
        return "ready"
    if t1 == "11":  # eating and drinking: name the meal by time of day
        if 4 * 60 <= clock < 10 * 60 + 30:
            return "breakfast"
        if clock < 15 * 60 + 30 and clock >= 10 * 60 + 30:
            return "lunch"
        return "dinner"
    if t1 == "18":
        return "travel"
    if t1 == "05":
        return "work"
    if t1 == "06":
        return "school"
    if t1 == "02":
        return "house"
    if t1 in ("03", "04"):
        return "care"
    if t1 in ("07", "08", "09", "10"):
        return "errands"
    if t1 == "13":
        return "exercise"
    if t2 in ("1201", "1601") or t1 == "16":
        return "social"
    if t2 in ("1202", "1204"):  # parties and celebrations; arts, movies, entertainment
        return "out"
    if t1 == "12":  # relaxing, TV, games, computer leisure, ...
        return "relax"
    if t1 in ("14", "15"):
        return "faith"
    return None  # unable to code etc.: folded into the neighbouring activity


def build(raw, year, out_path, seed=2019):
    age = {r["TUCASEID"]: int(r["TEAGE"]) for r in read_csv(f"{raw}/atusrost-{year}.zip", ".dat") if r["TULINENO"] == "1"}
    resp = {r["TUCASEID"]: r for r in read_csv(f"{raw}/atusresp-{year}.zip", ".dat")}

    episodes = defaultdict(list)
    for r in read_csv(f"{raw}/atusact-{year}.zip", ".dat"):
        clock = clock_minutes(r["TUSTARTTIM"])
        start = (clock - DAY_START_MIN) % 1440
        episodes[r["TUCASEID"]].append((start, int(r["TUACTDUR24"]), r["TRCODE"], clock))

    people = []
    for cid, r in resp.items():
        eps = sorted(episodes.get(cid, []))
        if not eps:
            continue
        # work minutes, and how many of them fall at night
        work = night = 0
        for start, dur, code, _ in eps:
            if code.startswith("0501"):
                for t in range(start, start + dur):
                    c = (t + DAY_START_MIN) % 1440
                    work += 1
                    night += c >= 20 * 60 or c < 6 * 60
        a = age.get(cid, 0)
        lfs = r["TELFS"]  # 1-2 employed, 3-4 unemployed, 5 not in labor force
        if work >= MIN_WORK_MINUTES:
            group = "night" if night / work >= NIGHT_SHARE else "day"
        elif r["TESCHENR"] == "1" and a <= 24:
            group = "student"
        elif lfs == "5" and a >= 65:
            group = "retired"
        elif lfs == "5" and 18 <= a < 65 and r["TESCHENR"] != "1":
            group = "home"
        elif lfs in ("1", "2"):
            group = "off"
        else:
            group = "other"

        # map to circle categories, fold uncodable bits into the previous activity, merge repeats
        day = []
        for start, _, code, clock in eps:
            cat = category(code, clock)
            if cat is None:
                continue
            if day and day[-1][1] == cat:
                continue
            day.append((start, cat))
        if not day:
            continue
        if day[0][0] != 0:  # first entry always starts the diary day at 4am
            day[0] = (0, day[0][1])

        weekday = r["TUDIARYDAY"] in "23456" and r["TRHOLIDAY"] == "0"
        people.append({
            "id": cid,
            "group": group,
            "age": a,
            "weekday": weekday,
            "weight": float(r["TUFINLWGT"]),
            "day": day,
        })

    rng = random.Random(seed)
    datasets = []
    for ds in DATASETS:
        pool = [p for p in people
                if (ds["days"] == "any" or p["weekday"] == (ds["days"] == "weekday"))
                and (ds["groups"] is None or p["group"] in ds["groups"])]
        # Weighted sampling without replacement (Efraimidis-Spirakis), so the sample is
        # representative of the population the survey weights describe.
        keyed = sorted(pool, key=lambda p: rng.random() ** (1.0 / p["weight"]), reverse=True)
        chosen = keyed[: ds["sample"]]
        datasets.append({
            "key": ds["key"],
            "label": ds["label"],
            "respondents": len(pool),
            # each person: [group index, age, start, activity, start, activity, ...]
            "people": [
                [next(i for i, (g, _) in enumerate(GROUPS) if g == p["group"]), p["age"]]
                + [x for start, cat in p["day"] for x in (start, ACT_INDEX[cat])]
                for p in chosen
            ],
        })

    out = {
        "source": {
            "name": f"American Time Use Survey {year}",
            "publisher": "U.S. Bureau of Labor Statistics",
            "url": "https://www.bls.gov/tus/",
            "license": "Public domain (U.S. government work)",
            "notes": "Diary days run 4:00am to 4:00am. Samples are drawn using the survey's final weights.",
        },
        "year": int(year),
        "dayStartMinutes": DAY_START_MIN,
        "activities": [{"key": k, "label": l} for k, l in ACTIVITIES],
        "groups": [{"key": k, "label": l} for k, l in GROUPS],
        "datasets": datasets,
    }
    with open(out_path, "w") as f:
        json.dump(out, f, separators=(",", ":"))
    for ds in datasets:
        print(f'{ds["key"]:8} {len(ds["people"]):4} people sampled from {ds["respondents"]} respondents')


if __name__ == "__main__":
    if len(sys.argv) != 4:
        sys.exit(__doc__)
    build(sys.argv[1], sys.argv[2], sys.argv[3])
