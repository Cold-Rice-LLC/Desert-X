import {HelpCircleIcon} from '@sanity/icons'
import {GuideTool} from './GuideTool'

/**
 * The editing guide, as a Guide tab in the Studio's top bar. The text is
 * guide.md; edit it there. To remove the tab, drop guideTool from the
 * config's tools and delete this folder.
 */
export const guideTool = () => ({
  name: 'guide',
  title: 'Guide',
  icon: HelpCircleIcon,
  component: GuideTool,
})
