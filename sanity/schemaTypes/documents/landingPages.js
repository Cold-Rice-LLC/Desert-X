import {DocumentTextIcon, EarthGlobeIcon, ImageIcon, SearchIcon} from '@sanity/icons'

/**
 * The landing pages and their default titles. Kept apart from the schema
 * in landings.js so scripts/createLandings.js can read it without loading
 * the Studio's UI.
 */
export const landingPages = [
  {name: 'newsLanding', title: 'News', icon: DocumentTextIcon},
  {name: 'artLanding', title: 'Art', icon: ImageIcon},
  {name: 'visitLanding', title: 'Visit', icon: EarthGlobeIcon},
  {name: 'searchLanding', title: 'Search', icon: SearchIcon},
]
