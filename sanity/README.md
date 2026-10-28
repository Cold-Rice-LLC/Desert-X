# Desert X Studio

The Sanity Studio for the Desert X site. The site itself is in `../svelte`.

```sh
npm run dev      # the Studio at localhost:3333
npm run deploy   # deploy the Studio
```

- **Singletons:** Site Settings, the Homepage (a `page` with the id `homepage`) and the landing pages (`newsLanding`, `artLanding`, `visitLanding`, `searchLanding`, listed in `schemaTypes/documents/landingPages.js`) each have one fixed document, laid out in `myStructure.js`.
- **Shared schema pieces:** `schemaTypes/objects/fields.js` (title and slug, heading, SEO, modules, fields shown for one case) and `schemaTypes/objects/linkTarget.js` (link fields).
- **Scripts**, run with `npx sanity exec scripts/<name>.js --with-user-token`:
  - `createLandings.js` creates any missing landing documents. Safe to rerun.
  - `migrate*.js` and `linkNewsEditions.js` imported content from the old desertx.org. They dry-run by default and write with `--import`. They replace documents, so don't rerun them over edited content.
