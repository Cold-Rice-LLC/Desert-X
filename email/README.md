# DESERT X Mailchimp template

A custom-coded Mailchimp template built from the two Figma newsletter frames
(Identity Guidelines file, nodes 682:4877 and 661:2).

- `template.html` — the template. Its default content is Design 1.
- `images/logo.png` — the wordmark, drawn from the site font's `[logo]` glyph at 4× (white background, so it stays visible in dark-mode inboxes).
- `images/sample-photo.jpg` — Design 1's photo, as placeholder content.
- `images/celebrate-10-years.jpg` — Design 2's gradient block, exported as one image.

## Uploading to Mailchimp

Zip `template.html` with the `images/` folder, then in Mailchimp go to
**Templates → Create Template → Code your own → Import zip**. Mailchimp uploads
the images and rewrites their paths.

```bash
cd email && zip -r desertx-mailchimp.zip template.html images
```

Custom-coded templates need a Standard plan or above.

## Modules

In the campaign editor, every block except the footer can be repeated, reordered
or removed:

| Module | Notes |
|---|---|
| Logo header | Links to desertx.org. Remove it for Design 2-style emails. |
| Image | Full width. Upload at 1280px wide (2× the 640px column) so it's sharp on retina screens. Set alt text and a link in the image settings. |
| Centered title | Displayed in capitals whatever is typed. |
| Text | Enter starts a new paragraph (two-line gap, as in the design). Shift+Enter twice gives a one-line gap, as between the two date groups. Don't leave an empty line at the end: it adds a gap before the next block. |

The footer is fixed: contact email, Mailchimp's preferences and unsubscribe links,
the trademark line, and the mailing address.

## Mailing address

The footer prints the audience's address with `*|LIST:ADDRESSLINE|*`. Set it in
**Audience → Settings → Audience name and defaults → Required email footer
content** to:

PO Box 4050, Palm Springs, CA 92263, US

## The font

Schengen loads from `https://desert-x.vercel.app/fonts/…` (the site already
serves it with `Access-Control-Allow-Origin: *`). It shows in Apple Mail, iOS
Mail, Outlook for Mac, Samsung Mail and Thunderbird; Gmail, Yahoo and Outlook on
Windows fall back to Helvetica/Arial.

When the site launches on desertx.org, change the URL in the `@font-face` rule
near the top of `template.html` (it's the only place) and re-upload. Emails
already sent keep the old URL, so keep the vercel.app address working, or they'll
fall back to Helvetica.

## Sizes

Desktop sizes come straight from the Figma type styles (35px body and titles,
22px footer, 640px column). Phones get the same layout scaled down (20px body,
13px footer, stacked footer columns). Outlook on Windows ignores media queries,
so it's given the desktop sizes in an `[if mso]` block.
