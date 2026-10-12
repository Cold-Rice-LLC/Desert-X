import siteSettings from './siteSettings'
import page from './documents/page'
import artist from './documents/artist'
import artwork from './documents/artwork'
import news from './documents/news'
import location from './documents/location'
import edition from './documents/edition'
import navLink from './objects/navLink'
import richText from './objects/richText'
import textModule from './modules/textModule'
import scheduleModule from './modules/scheduleModule'
import mediaModule from './modules/mediaModule'
import bioModule from './modules/bioModule'
import interviewModule from './modules/interviewModule'
import peopleListModule from './modules/peopleListModule'
import dropdownsModule from './modules/dropdownsModule'

export const schemaTypes = [
  // Documents
  siteSettings,
  page,
  artist,
  artwork,
  news,
  location,
  edition,
  // Objects
  navLink,
  richText,
  // Modules
  textModule,
  scheduleModule,
  mediaModule,
  bioModule,
  interviewModule,
  peopleListModule,
  dropdownsModule,
]
