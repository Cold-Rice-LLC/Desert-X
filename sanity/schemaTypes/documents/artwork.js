import {defineField, defineType} from 'sanity'
import {ImageIcon} from '@sanity/icons'

export default defineType({
  name: 'artwork',
  type: 'document',
  title: 'Artwork',
  icon: ImageIcon,
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
    defineField({
      name: 'edition',
      type: 'reference',
      title: 'Edition',
      to: [{type: 'edition'}],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      artist0: 'artists.0.title',
      artist1: 'artists.1.title',
      edition: 'edition.title',
    },
    prepare({title, artist0, artist1, edition}) {
      const artists = [artist0, artist1].filter(Boolean).join(', ')
      return {
        title,
        subtitle: [artists, edition].filter(Boolean).join(' · '),
      }
    },
  },
})
