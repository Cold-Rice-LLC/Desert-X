import {defineField, defineType} from 'sanity'
import {CalendarIcon} from '@sanity/icons'

export default defineType({
  name: 'edition',
  type: 'document',
  title: 'Edition',
  icon: CalendarIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      description: 'e.g. Coachella Valley 2025',
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
      name: 'location',
      type: 'reference',
      title: 'Location',
      to: [{type: 'location'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'year',
      type: 'number',
      title: 'Year',
      validation: (rule) => rule.required().integer().min(2017),
    }),
  ],
  orderings: [
    {
      title: 'Year, newest first',
      name: 'yearDesc',
      by: [{field: 'year', direction: 'desc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      location: 'location.title',
      year: 'year',
    },
    prepare({title, location, year}) {
      return {
        title,
        subtitle: [location, year].filter(Boolean).join(' · '),
      }
    },
  },
})
