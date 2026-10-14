import siteSettings from './siteSettings'
import page from './documents/page'
import artist from './documents/artist'
import artwork from './documents/artwork'
import news from './documents/news'
import location from './documents/location'
import edition from './documents/edition'
import {landings} from './documents/landings'
import navLink from './objects/navLink'
import palette from './objects/palette'
import richText from './objects/richText'
import seo from './objects/seo'
import textModule from './modules/textModule'
import scheduleModule from './modules/scheduleModule'
import mediaModule from './modules/mediaModule'
import bioModule from './modules/bioModule'
import interviewModule from './modules/interviewModule'
import peopleListModule from './modules/peopleListModule'
import dropdownsModule from './modules/dropdownsModule'
import newsModule from './modules/newsModule'
import donateModule from './modules/donateModule'

export const schemaTypes = [
  // Documents
  siteSettings,
  page,
  artist,
  artwork,
  news,
  location,
  edition,
  ...landings,
  // Objects
  navLink,
  palette,
  richText,
  seo,
  // Modules
  textModule,
  scheduleModule,
  mediaModule,
  bioModule,
  interviewModule,
  peopleListModule,
  dropdownsModule,
  newsModule,
  donateModule,
]
