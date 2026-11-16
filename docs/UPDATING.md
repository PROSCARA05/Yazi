# How to keep YAZI up to date

All listings on the site live in **one file: `data/content.json`**. Change it, and the live site changes within a few minutes. You do not need to install anything.

---

## 1. When to check

| What | How often | Why |
|---|---|---|
| Learnerships and internships | Every week | They open and close within 2 to 4 weeks |
| Bursaries and scholarships | Every month | Most stay open for a few months |
| Universities, TVET and private colleges | Twice a year: when applications open (around April) and before they close | Dates change once a year |
| NSFAS | When applications open for the next year | One big window a year |

Put a weekly reminder in your calendar, for example "YAZI: check learnerships".

## 2. Where to get the information

Use **official sources only**:
- the institution's or company's own website
- SA Youth: sayouth.mobi
- SETA websites
- NSFAS: nsfas.org.za

Do not copy from other listing websites. They are often out of date or wrong.

## 3. How to edit on GitHub (no software needed)

1. Go to the repo on github.com and sign in.
2. Open the `data` folder, then `content.json`.
3. Click the **pencil icon** (Edit this file) at the top right of the file.
4. Make your change (see the examples below).
5. Click **Commit changes…**, write a short message such as `Add Clover learnership` or `Update UJ closing date`, and click **Commit changes**.
6. Wait 2 to 3 minutes, then open the live site and check that your change shows.

**If your change does not show**, or the site shows old information, there is probably a typing mistake in the file (a missing comma or quote mark). Open the file again and compare your entry with the examples below. Until it is fixed, the site keeps showing the last good version, so nothing breaks for learners.

**If you also work on the site from a computer with Git CMD**, always run `git pull` before you change anything there. It downloads the edits made on GitHub, so the two copies do not clash.

## 4. Examples

Every entry sits between `{` and `}`. Entries are separated by a comma. Dates are always written **year-month-day**, e.g. `2026-11-30`.

### Add a learnership

Copy this block, paste it after an existing learnership's closing `},` and fill it in:

```json
{
 "type": "learnership",
 "id": "learn-company-name-2027",
 "name": "Company Name Learnership 2027",
 "kind": "Learnership (12 months, R4,000 a month stipend)",
 "location": "Johannesburg, Gauteng",
 "province": "Gauteng",
 "requirements": "Matric. SA citizen aged 18 to 35. Unemployed.",
 "applyUrl": "https://company-website/careers",
 "datesText": "Opens 1 December 2026, closes 15 December 2026",
 "opens": "2026-12-01",
 "closes": "2026-12-15",
 "rolling": false,
 "checkDates": false,
 "checkedOn": "2026-11-20"
},
```

- `id` must be unique: lower case, words joined with `-`.
- `province` is one of: `Eastern Cape`, `Free State`, `Gauteng`, `KwaZulu-Natal`, `Limpopo`, `Mpumalanga`, `Northern Cape`, `North West`, `Western Cape`, or `National` (anywhere in South Africa).
- In several provinces? Replace the `province` line with `"province": "Several provinces", "provinces": ["Gauteng", "KwaZulu-Natal"],`.
- No opening date given? Leave out the `"opens"` line.
- Applying by email? Use `"applyUrl": "mailto:jobs@company.co.za",`.

**You never need to delete old learnerships.** The site hides each one by itself 14 days after its closing date. To change the number of days, edit `"hideClosedLearnershipsAfterDays": 14` near the top of the file.

### Update a university's dates for a new year

Find the university by name and change only these lines:

```json
 "datesText": "Opens 1 Apr 2027, Closes 31 Jul 2027",
 "closes": "2027-07-31",
 "checkedOn": "2027-04-02",
```

If there is a new prospectus, replace the `"prospectusUrl"` link too.

### Add a bursary

```json
{
 "type": "funding",
 "id": "bursary-name-2027",
 "name": "Bursary Name 2027",
 "province": "National",
 "requirements": "Matric with 60% in Mathematics. Studying engineering at a public university.",
 "applyUrl": "https://official-website/bursary",
 "datesText": "Closes 31 January 2027",
 "closes": "2027-01-31",
 "rolling": false,
 "checkDates": false,
 "checkedOn": "2026-11-20"
},
```

### Other useful settings on each entry

| Setting | Use it when |
|---|---|
| `"rolling": true` | Applications are open all year, with no closing date (set `"closes": null`) |
| `"checkDates": true` | You are not sure the dates are right. The site then tells learners to confirm with the institution |
| `"thirdPartyLink": true` | The apply link is not on the organisation's own website |

### After every update session

Near the top of the file, change `"compiled"` to today's date. The home page shows it as **"Information last updated"**:

```json
 "compiled": "2026-11-20",
```

## 5. Optional: refreshing the backup copy

`data/content.js` is a backup copy of the data. It is used when someone opens the site straight from a folder (not online), or if `content.json` has a mistake. Online, the site always reads `content.json`.

Every few months, if you have Node.js installed, refresh the backup in Git CMD:

```
node tools/build-content.js
git add .
git commit -m "Refresh backup data"
git push
```
