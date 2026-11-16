# YAZI website

Designed and developed by SyntaxConnect.

A fast, static website that helps Grade 12 learners and matriculants find realistic options after matric.
Plain HTML, CSS and JavaScript. No build step, no server code.

## Structure

    index.html               Home page, options finder and browse-by-category links
    explore.html             Browse all: universities, TVET colleges, private, funding, learnerships
    about.html               About, founder, contact, disclaimer and privacy
    sitemap.xml              List of pages for Google Search Console
    syntaxconnect.html       SyntaxConnect "coming soon" page (linked from the footer credit)
    css/style.css            All styling (light and dark mode)
    js/common.js             Shared helpers, mobile menu and the contact email (CONTACT_EMAIL)
    js/app.js                Options finder
    js/explore.js            Browse page (tabs, name search, province and status filters)
    data/content.json        All content: finder options and every listed option. Edit this one
    data/content.js          Backup copy of content.json for offline use. Rebuild with tools/build-content.js
    tools/build-content.js   Rebuilds data/content.js after you edit data/content.json
    docs/UPDATING.md         How to keep the listings up to date (start here)
    docs/CONTENT-REVIEW.md   Data that still needs checking

## Releasing an update

Browsers keep copies of `css/style.css` and the `js/` files. Each page loads them with `?v=20261116` on the end.
When you change any CSS or JS file, change that number in **index.html, explore.html and about.html** (for example to today's date),
so every visitor's browser downloads the new files instead of using its old copy. Editing `data/content.json` does not need this.

## Run it locally

The pages load data/content.json, so they must be served, not opened by double-click.

    python3 -m http.server 8000

Then open http://localhost:8000

## How content works

data/content.json has three parts:

- "compiled": the date the list was put together (shown to users, and used for the out-of-date warning after "staleDays")
- "options": the finder cards (university, TVET, funding and so on). Each can point to a directory tab.
- "institutions": one record per university, TVET college, private institution or funding option

An institution record:

- type: public, tvet, private or funding (subtype "uot" marks universities of technology)
- province: a province name, or "National"
- datesText: the dates exactly as supplied. Shown to users.
- closes: closing date as YYYY-MM-DD. Drives the Open, Closing soon and Closed status automatically. Use null if there is none.
- rolling: true for rolling intakes. checkDates: true if the supplied dates look wrong or unclear.
- applyUrl, prospectusUrl, requirements (funding), checkedOn (date the entry was last checked)
- prospectusThirdParty / prospectusMaybeOld: optional flags that show a note to users

Status is worked out in the visitor's browser from "closes", so it never goes out of date by itself.
When a new application cycle starts, update datesText and closes for each entry and set checkedOn.

## Deploy

Push the folder to a GitHub repository and connect it to Cloudflare Pages or Netlify.
Build command: none. Publish directory: the project root.

## Before launch

- Work through docs/CONTENT-REVIEW.md
- Check that the YAZI name and a domain are available
- Test on a low-end Android phone and a slow connection

## Adding Supabase later

Change only loadContent() in js/common.js. Keep the JSON field names as table columns.
Use only the public anon key in the browser, protect tables with row-level security, and keep publishing a static copy of the content so the site works if the database is down.

## Editing content (important)

Edit data/content.json, then run:

    node tools/build-content.js

This writes data/content.js, which the pages load. Because of this the site also works when you open index.html straight from a folder, and when hosted. Commit both files.
