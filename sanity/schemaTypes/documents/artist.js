import {defineField, defineType} from 'sanity'
import {UserIcon} from '@sanity/icons'
import {titleSlugFields} from '../objects/fields'

export default defineType({
  name: 'artist',
  type: 'document',
  title: 'Artist',
  icon: UserIcon,
  fields: [
    ...titleSlugFields({title: {title: 'Name'}}),
    defineField({
      name: 'sortName',
      type: 'string',
      title: 'Sort Name',
      description:
        'Optional. What the artist is sorted and grouped by on the Art page, e.g. Smith for Phillip K Smith III. Leave empty to sort by the last word of the name.',
    }),
  ],
})
