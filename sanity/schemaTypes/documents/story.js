import {defineField, defineType} from 'sanity'
import {BookIcon} from '@sanity/icons'

export default defineType({
  name: 'story',
  type: 'document',
  title: 'Story',
  icon: BookIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
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
      name: 'artists',
      type: 'array',
      title: 'Artists',
      of: [{type: 'reference', to: [{type: 'artist'}]}],
      validation: (rule) => rule.unique(),
    }),
  ],
})
