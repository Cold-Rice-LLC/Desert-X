import siteSettings from './siteSettings'
import page from './documents/page'
import artist from './documents/artist'
import artwork from './documents/artwork'
import story from './documents/story'
import location from './documents/location'
import edition from './documents/edition'
import placeholderModule from './modules/placeholderModule'

export const schemaTypes = [
  // Documents
  siteSettings,
  page,
  artist,
  artwork,
  story,
  location,
  edition,
  // Modules
  placeholderModule,
]
