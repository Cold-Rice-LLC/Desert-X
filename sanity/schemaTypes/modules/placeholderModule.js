import {defineField, defineType} from 'sanity'
import {BlockContentIcon} from '@sanity/icons'

// Temporary member type so the `modules` array on `page` is valid.
// Replace with real modules as they are designed.
export default defineType({
  name: 'placeholderModule',
  type: 'object',
  title: 'Placeholder',
  icon: BlockContentIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
    }),
  ],
})
