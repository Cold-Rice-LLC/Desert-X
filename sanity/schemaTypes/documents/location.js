import {defineField, defineType} from 'sanity'
import {PinIcon} from '@sanity/icons'
import {titleSlugFields} from '../objects/fields'

export default defineType({
  name: 'location',
  type: 'document',
  title: 'Location',
  icon: PinIcon,
  fields: [
    ...titleSlugFields(),
    defineField({
      name: 'palette',
      type: 'palette',
      title: 'Palette',
    }),
  ],
})
