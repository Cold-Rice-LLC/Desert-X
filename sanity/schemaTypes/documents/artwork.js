import {defineArrayMember, defineField, defineType} from 'sanity'
import {ImageIcon} from '@sanity/icons'
import {moduleMembers} from '../modules'

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
      description: 'Add the year when another artwork already has the title, e.g. mirage-2020.',
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
      name: 'artistCredit',
      type: 'string',
      title: 'Artist Credit',
      description:
        'Optional. Replaces the artists’ names on the page, e.g. Lauren Bon and Metabolic Studio.',
    }),
    defineField({
      name: 'artistInfo',
      type: 'text',
      title: 'Artist Info',
      description:
        'Shown under the artist’s name, line for line, e.g. b. 1973, Chicago / Based in New York.',
      rows: 3,
    }),
    defineField({
      name: 'edition',
      type: 'reference',
      title: 'Edition',
      to: [{type: 'edition'}],
    }),
    defineField({
      name: 'images',
      type: 'array',
      title: 'Images',
      description: 'Shown at the top, cropped to 4:3. Two or more become a carousel.',
      of: [defineArrayMember({type: 'image', options: {hotspot: true}})],
      options: {layout: 'grid'},
    }),
    defineField({
      name: 'modules',
      type: 'array',
      title: 'Modules',
      of: moduleMembers,
    }),
    defineField({
      name: 'site',
      type: 'text',
      title: 'Site',
      description:
        'Where the artwork stands, line for line, e.g. Homme Adams Park / Palm Desert, CA. For the map.',
      rows: 3,
    }),
    defineField({
      name: 'coordinates',
      type: 'geopoint',
      title: 'Coordinates',
      description: 'For the map.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      artist0: 'artists.0.title',
      artist1: 'artists.1.title',
      artistCredit: 'artistCredit',
      edition: 'edition.title',
      media: 'images.0',
    },
    prepare({title, artist0, artist1, artistCredit, edition, media}) {
      const artists = artistCredit || [artist0, artist1].filter(Boolean).join(', ')
      return {
        title,
        subtitle: [artists, edition].filter(Boolean).join(' · '),
        media,
      }
    },
  },
})
