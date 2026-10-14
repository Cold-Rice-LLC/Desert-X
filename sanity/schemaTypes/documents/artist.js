import {defineField, defineType} from 'sanity'
import {UserIcon} from '@sanity/icons'

export default defineType({
  name: 'artist',
  type: 'document',
  title: 'Artist',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Name',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sortName',
      type: 'string',
      title: 'Sort Name',
      description:
        'Optional. What the artist is sorted and grouped by on the Art page, e.g. Smith for Phillip K Smith III. Leave empty to sort by the last word of the name.',
    }),
  ],
})
