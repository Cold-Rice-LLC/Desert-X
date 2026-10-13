import {
  DocumentTextIcon,
  EarthGlobeIcon,
  ImageIcon,
  PinIcon,
  SearchIcon,
  UserIcon,
} from '@sanity/icons'

/**
 * The landing pages and their default titles. Kept apart from the schema
 * in landings.js so scripts/createLandings.js can read it without loading
 * the Studio's UI.
 */
export const landingPages = [
  {name: 'newsLanding', title: 'News', icon: DocumentTextIcon},
  {name: 'artistsLanding', title: 'Artists', icon: UserIcon},
  {name: 'artLanding', title: 'Art', icon: ImageIcon},
  {name: 'locationsLanding', title: 'Locations', icon: PinIcon},
  {name: 'visitLanding', title: 'Visit', icon: EarthGlobeIcon},
  {name: 'searchLanding', title: 'Search', icon: SearchIcon},
]
