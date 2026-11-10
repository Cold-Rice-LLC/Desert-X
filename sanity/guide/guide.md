# Desert X — Website Editing Guide

A guide to editing desertx.org in the Studio: every section of the Content list, what each field does on the live site, and what to check when something doesn't show up.

Last updated 10 November 2026.

## Contents

1. [Getting around the Studio](#1-getting-around-the-studio)
2. [Things that work the same everywhere](#2-things-that-work-the-same-everywhere)
3. [Homepage](#3-homepage)
4. [Landing pages: Art, News, Visit, Search](#4-landing-pages-art-news-visit-search)
5. [Locations](#5-locations)
6. [Editions](#6-editions)
7. [Artists](#7-artists)
8. [Artworks](#8-artworks)
9. [Spanish translations](#9-spanish-translations)
10. [News and press](#10-news-and-press)
11. [Pages](#11-pages)
12. [Modules](#12-modules)
13. [Site Settings: menu, footer and defaults](#13-site-settings-menu-footer-and-defaults)
14. [Images, video, alt text and captions](#14-images-video-alt-text-and-captions)
15. [Search engines and sharing](#15-search-engines-and-sharing)
16. [Why isn't it showing up?](#16-why-isnt-it-showing-up)

## 1. Getting around the Studio

The Studio lives at `desert-x.sanity.studio`. Sign in with the Sanity account you were invited with. The tabs along the top are:

| Tab           | What it's for                                                                        |
| ------------- | ------------------------------------------------------------------------------------ |
| **Structure** | All the site's content, in the Content list described below. Most work happens here. |
| **Media**     | Every uploaded image and video, with its alt text and caption.                       |
| **Vision**    | A query tool for developers. You can ignore it.                                      |
| **Guide**     | This guide.                                                                          |

The Content list in **Structure** is arranged like this:

| Item              | What it holds                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------- |
| **Pages**         | The Homepage, the four landing pages (News, Art, Visit, Search) and every other page, e.g. About. |
| **Locations**     | Each place Desert X happens, e.g. Coachella Valley, AlUla. Each has its own colours.              |
| **Editions**      | One per exhibition: a location in a year, e.g. Coachella Valley 2025.                             |
| **Artists**       | One per artist, linked from their artworks.                                                       |
| **Artworks**      | One per work, belonging to an edition.                                                            |
| **News**          | News articles, and press items that link out to an article elsewhere.                             |
| **Site Settings** | The menu, footer, Donate link and the site-wide sharing defaults.                                 |

The pieces connect in a chain: a **location** has **editions**, an edition has **artworks**, and an artwork has one or more **artists**. Open a location, edition or artist and you'll find a second tab beside the form, **Editions** or **Artworks**, listing everything connected to it, with a **New …** button that starts a new one already linked back. That's the quickest way to add, say, a new artwork to an edition.

## 2. Things that work the same everywhere

### Publishing

Your changes save as a draft as you type, but nothing changes on the live site until you press **Publish** at the bottom of the document. Once published, the change shows on the site within about a minute. To throw away unpublished changes, use the menu beside Publish and choose **Discard changes**.

A document that's never been published doesn't exist on the site at all: links to it, lists and the map leave it out.

The Homepage, the landing pages and Site Settings are fixed documents. They can be edited and published, but not deleted or duplicated.

### Title and Slug

Most documents start with a **Title**, used as the page heading and in lists across the site. The **Slug** under it is the last part of the page's address, e.g. `mirage` in `desertx.org/art/mirage`. Press **Generate** to make it from the title.

Change a slug carefully once a page is live: the old address stops working, and any links to it from elsewhere on the web break.

### Links

Wherever you can add a link (menu items, footer links, homepage slides, links inside text) you choose a **Link Type**:

- **Internal** links to a page on the site: pick a page, edition, artwork, news article, landing page or location. Linking to a **location** goes to its newest edition, so the link stays current year to year.
- **External** links to a full web address, which opens in a new tab. Links inside text also take `mailto:` and `tel:` addresses.
- **None**, where offered, removes the link.

### Rich text

Formatted text fields offer two paragraph styles, **Normal** and **Small** (for closing credits like "Generous support provided by…"), plus italics and links. There are no headings or bullet lists in rich text; use a module's Heading, or the Dropdowns or Schedule modules, for structure.

### Modules

Pages, artworks, news articles and the Visit page are built from **modules**: blocks of content stacked in order, e.g. a Text, then an image, then a set of Dropdowns. Add one with **Add item** at the bottom of the Modules field, and drag the handle on the left to reorder. Each type is described in [section 12](#12-modules).

### SEO

Most documents end with a collapsed **SEO** section. Every field in it is optional. See [section 15](#15-search-engines-and-sharing).

## 3. Homepage

**Pages → Homepage.** The homepage is a full-screen carousel and nothing else, so it has no modules.

**Slides** are shown in order. Each fills the window; clicking the left or right half of the screen goes back or forward, and the last slide loops round to the first. For each slide:

- **Media Type**: an **Image**, or a **Video** (an MP4, which plays muted on a loop). A video can have a **Poster**, an image shown while it loads.
- Set the image's **hotspot** (see [section 14](#14-images-video-alt-text-and-captions)) so the important part stays in view on every screen shape.

What else a slide shows depends on **Quick Links**, a switch at the top:

- **Quick Links off:** each slide has a **Link** and a **Title**, shown at the bottom left and linking where the slide goes. Leave the Title empty to use the linked artwork's artist and title, or the linked page's title.
- **Quick Links on:** the footer's links (from Site Settings) run along the bottom of the carousel, and each slide has a **Headline** centred over it instead, fading in as the slide arrives. Consecutive slides can carry one sentence across them.

## 4. Landing pages: Art, News, Visit, Search

**Pages → News / Art / Visit / Search.** These four pages are built by the site itself (the list of artworks, the news listing, and so on), so each has only a few fields. Every one has a **Title**, shown in the nav next to the menu button, and SEO.

- **Art** lists every artwork, grouped by artist. Its **Intro** shows above the list and grid.
- **News** lists all news and press, newest first. Its **General Palette** is the four colours used for news tiles that have no location (see [section 10](#10-news-and-press)).
- **Visit** shows its own **Modules** first: general visitor information. Then each edition that's on follows with its **Visit Info** and map (see [section 6](#6-editions)), then the latest news.
- **Search** has an **Intro** shown above the search field.

## 5. Locations

**Locations** are the places Desert X happens. Each has a **Title**, a **Slug** and a **Palette** of exactly four colours. News tiles for that location mix the palette into a gradient.

The footer's first column lists every location, each linking to its newest edition. A location has no page of its own: linking to one always goes to its newest edition.

## 6. Editions

**Editions** are the exhibitions. A new one is easiest to start from its location's **Editions** tab.

| Field                        | What it does                                                                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Title**                    | E.g. Coachella Valley 2025.                                                                                                                             |
| **Slug**                     | The location then the year, e.g. `california-2025`. The page is at `desertx.org/editions/california-2025`.                                              |
| **Location**, **Year**       | Required. The newest year is the location's current edition.                                                                                            |
| **Start Date**, **End Date** | When it's on. Shown on the page, and they decide when the edition appears on the Visit page.                                                            |
| **Show on Visit Page From**  | Optional. Puts the edition on the Visit page ahead of its Start Date, e.g. to announce it. It still leaves after its End Date.                          |
| **Images**                   | Shown at the top, cropped to 4:3. Two or more become a carousel. Leave empty to use the first image of each of the edition's artworks.                  |
| **Description**              | Shown under the dates.                                                                                                                                  |
| **Map Text**                 | Shown under the exhibition map, e.g. a link to the app.                                                                                                 |
| **Visit Info**               | Modules shown on the Visit page while the edition is on, above its map, e.g. Hours and Dates, Getting There and Accessibility as Dropdowns.             |
| **Sponsor Groups**           | Panels of logos under the artworks, e.g. Premier Sponsors. Groups pair up side by side unless set to **Full Width**, which also makes the logos larger. |
| **Sponsor Lists**            | Up to four titled columns of names under the logos, e.g. Galleries. One name per line; select a name and add a link to link it.                         |

The edition's artworks list themselves on its page; you don't add them here. Its **Artworks** tab shows them. The **exhibition map** shows every artwork in the edition that has **Coordinates**.

**Sponsor logos:** each logo needs a **Name** (read out by screen readers in place of the logo) and an image. Use an SVG or a transparent PNG, trimmed to the logo's edges. A white background is blended away, so a JPG with a white background will also work. **Link** is optional.

## 7. Artists

**Artists** have a **Name** and a **Slug**, and can be linked from any number of artworks.

The Art page sorts and groups artists by last name, taken as the last word of the Name. Where that's wrong, e.g. Phillip K Smith III, fill in **Sort Name** (Smith).

An artist's **Artworks** tab lists their works, with a button to start a new one by them.

## 8. Artworks

**Artworks** are the heart of the site: each has a page at `desertx.org/art/<slug>`, appears on the Art page and its edition's page, and on the exhibition map if it has coordinates.

| Field             | What it does                                                                                                                                                                                                     |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Title**         | The artwork's title.                                                                                                                                                                                             |
| **Slug**          | Add the year when another artwork already has the title, e.g. `mirage-2020`.                                                                                                                                     |
| **Artists**       | One or more artists. Each artist can only be added once.                                                                                                                                                         |
| **Artist Credit** | Optional. Replaces the artists' names on the page, e.g. Lauren Bon and Metabolic Studio.                                                                                                                         |
| **Artist Info**   | Shown under the artist's name, line for line, e.g. `b. 1973, Chicago` then `Based in New York` on the next line.                                                                                                 |
| **Spanish**       | Spanish versions of the title, artist info and some module text. See [section 9](#9-spanish-translations).                                                                                                       |
| **Edition**       | The edition it was shown in.                                                                                                                                                                                     |
| **Images**        | Shown at the top, cropped to 4:3. Two or more become a carousel.                                                                                                                                                 |
| **Thumbnail**     | Optional. Shown on the map when the artwork is chosen, cropped to 4:3. Without one, the first image is used.                                                                                                     |
| **Modules**       | The rest of the page: text, more images and video, interviews and so on. See [section 12](#12-modules).                                                                                                          |
| **Site**          | Where the artwork stands, line for line, e.g. `Homme Adams Park` then `Palm Desert, CA`. Shown on the map.                                                                                                       |
| **Coordinates**   | The artwork's position on the map, as **Latitude** and **Longitude**. In Google Maps, right-click the spot and click the numbers at the top of the menu to copy them. Without coordinates it's left off the map. |

## 9. Spanish translations

Artwork pages can be read in Spanish: visitors pick **EN / ES** above the title, and the page reloads at the same address with `?lang=es` on the end.

Each translatable field has a Spanish twin in a collapsed **Spanish** section next to it:

- on the artwork itself: **Title** and **Artist Info**
- in **Text** modules: **Heading** and **Text**
- in **Media** modules: **Caption** and **Second Caption**

Anything left empty shows in English, so a partial translation is fine. **EN / ES** only appears on an artwork that has at least one Spanish field filled in. The nav, footer and the rest of the site stay in English.

## 10. News and press

**News** holds two kinds of item, picked with **Kind** at the top:

- **News** is an article with its own page, at `desertx.org/news/<slug>`.
- **Press** is a link out to coverage elsewhere. It has no page of its own; its tile opens the article in a new tab.

Both kinds have a **Title**, a **Publish Date** (the listing is ordered by it, newest first) and an optional **Edition**. Linking an edition shows the item in the News on that edition's page.

**News articles** also have:

- **Location**: the tile takes its colours from the location's palette. Leave it empty for General, which uses the News page's General Palette.
- **Card Text**: optional. Replaces the title, location and date on the tile, exactly as typed, up to 150 characters. The tile fits about 17 characters to a line and cuts off after 13 lines, blank lines included.
- **Modules**: the article itself. Three other news items show at the bottom on their own, favouring related ones.

**Press items** also need:

- **Publication**: where it ran, e.g. Art Review.
- **Article URL**: the full address of the article.
- **Featured Image**, shown on the tile, and **Logo**, the publication's logo shown over it. Use a white logo, ideally an SVG.

## 11. Pages

**Pages → All pages** holds every other page, e.g. About or Support. A page's address is its slug, e.g. `desertx.org/about`.

A page is a **Title** and **Modules**. Pages can use every module, including three that only pages offer: **News**, **Donate** and **Newsletter Signup**. A new page isn't in the menu or footer until you add a link to it in [Site Settings](#13-site-settings-menu-footer-and-defaults).

## 12. Modules

Every module except Media and People List starts with an optional **Heading**.

| Module                               | What it shows                                                                                                                                                                                            |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Text**                             | A block of rich text.                                                                                                                                                                                    |
| **Media**                            | An image, an MP4 video, or a YouTube or Vimeo video, with a caption. See below.                                                                                                                          |
| **Dropdowns**                        | A list of titles that each open to show their content, e.g. FAQs or Getting There.                                                                                                                       |
| **Schedule**                         | A list of times, e.g. "10:00 AM – 12:00 PM", each with details.                                                                                                                                          |
| **Bios**                             | People with a photo, **Image Text** beside it (e.g. name and role) and a bio.                                                                                                                            |
| **Interview**                        | A conversation as **Exchanges**, each a **Speaker** (e.g. DX; the colon is added for you) and their words.                                                                                               |
| **People List**                      | Two titled lists of names, typed exactly as they should show, e.g. "Name, Role" on each line. The left list has one column; the right list has two.                                                      |
| **News** _(pages only)_              | Three news tiles: the **Latest**, or one to three **Selected** items.                                                                                                                                    |
| **Donate** _(pages only)_            | A donation card with an image, title, text and up to four preset **Amounts** in dollars. Visitors pick one-time or monthly and an amount (or type their own), then continue to the secure donation form. |
| **Newsletter Signup** _(pages only)_ | An email field and Sign Up button, with optional **Text** above. Sign-ups go to the Desert X Mailchimp list.                                                                                             |

### Media module

Choose a **Media Type**:

- **Image**: one image, or two side by side by adding a **Second Image** (both are then cropped to 4:5).
- **MP4**: upload a video file. It plays with controls.
- **YouTube**: the **YouTube ID**, the 11 characters after `v=` in the video's address. For `youtube.com/watch?v=dQw4w9WgXcQ` that's `dQw4w9WgXcQ`.
- **Vimeo**: the video's full `vimeo.com` address.

Videos can have a **Poster** image, shown before they play. **Caption** is shown under the media, e.g. the artist, the title in italics and the year. For images and MP4s, leaving it empty uses the caption saved on the file in the Media library (see [section 14](#14-images-video-alt-text-and-captions)).

## 13. Site Settings: menu, footer and defaults

**Site Settings** holds what appears on every page.

**Donate Link** is the underlined link at the top right of the nav.

**Menu**

- **Menu Items** are the main menu, in order. Each has a **Label** and a Link Type: Internal or External as usual, or **Sub-items**, which makes the item open a list of further links in the menu instead of going anywhere. Sub-items linking to a location get the Desert X mark.
- **Menu Text** is shown under the menu items until one with sub-items is opened.

**Footer**

- The first column lists each location automatically. **Links** is the second column. It's also what runs along the homepage carousel when Quick Links is on.
- **Text** and **Credits** are rich text shown in the footer.

**Metadata** holds the site-wide defaults for search results and sharing. See [section 15](#15-search-engines-and-sharing).

## 14. Images, video, alt text and captions

### Uploading

Drag an image onto any image field, or click **Select** to choose one already in the Media library. Upload the largest version you have: the site makes smaller copies for each screen itself, and never enlarges an image, so there's no need to resize or compress first. Homepage slides especially should be at least 3000 pixels wide. Videos must be MP4s. Keep homepage and module videos short and compressed, as they're downloaded in full.

### Hotspot and crop

Most images on the site are cropped to fit their space: 4:3 at the top of artworks and editions, the full window on the homepage, 1200 × 630 when shared. Click the crop icon on an image field to set the **hotspot**, the circle marking the part of the image that must stay in view. The crop rectangle trims the image everywhere it's used.

### Alt text and captions

Alt text and default captions belong to the file itself, so they follow it everywhere it's used. Set them in the **Media** tab: open an image and fill in **Alt Text** (a short description for people using screen readers) and **Description**, which is the default caption. A Media module's own Caption overrides it for that one use.

Write alt text for every image that carries meaning: what it shows, not what it is ("A mirrored pavilion reflecting desert scrub at dusk", not "Image of artwork").

## 15. Search engines and sharing

What search results and shared links show comes, for each page, from the first of these that's filled in:

1. the document's own **SEO** section: **Title** (keep it under about 60 characters; "— Desert X" is added after it), **Description** (under about 160 characters) and **Share Image**
2. the page itself: its title, the start of its text, its first image
3. **Site Settings → Metadata**: **Site Title**, **Meta Description** and **Share Image**

So most pages need nothing filled in. Use SEO when the automatic version reads badly, e.g. a description that starts mid-sentence. Share images are cropped to 1200 × 630 around the hotspot.

Spanish versions of artworks share the English page's address in search results.

## 16. Why isn't it showing up?

- **Did you publish?** Drafts never show on the site. Check that the button at the bottom says **Published** rather than **Publish**.
- **Give it a minute.** Published changes can take about a minute to appear. Reload the page.
- **An artwork isn't on its edition's page:** check its **Edition** field.
- **An artwork isn't on the map:** it needs **Coordinates** and an **Edition**.
- **An edition isn't on the Visit page:** today needs to be between its Start and End Date, or after its Show on Visit Page From date. Check the dates are filled in.
- **EN / ES isn't showing on an artwork:** at least one Spanish field needs to be filled in.
- **A news tile is the wrong colour:** it takes its colours from its Location, or from the News page's General Palette when it has none.
- **Card Text is cut off:** tiles stop after 13 lines; shorten it or remove blank lines.
- **A new page isn't in the menu:** add it under Site Settings → Menu Items or the footer Links.
- **A link goes to the wrong edition:** a link to a location always goes to its newest edition (highest Year). Link to the edition itself to pin it.
- **A slug change broke a link:** the old address no longer works. Change the slug back, or update the links pointing at it.
- **Something can't be published:** a red error marker beside Publish lists what's missing. Click it to jump to the field.
