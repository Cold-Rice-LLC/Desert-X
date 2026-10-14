import {defineArrayMember, defineField, defineType} from 'sanity'
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
      description: 'The location then the year, e.g. california-2025.',
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
    defineField({
      name: 'startDate',
      type: 'date',
      title: 'Start Date',
    }),
    defineField({
      name: 'endDate',
      type: 'date',
      title: 'End Date',
      validation: (rule) =>
        rule.custom((value, context) =>
          value && context.document?.startDate && value < context.document.startDate
            ? 'End Date is before Start Date.'
            : true,
        ),
    }),
    defineField({
      name: 'images',
      type: 'array',
      title: 'Images',
      description:
        'Shown at the top, cropped to 4:3. Two or more become a carousel. Leave empty to show the first image of each artwork in the edition.',
      of: [defineArrayMember({type: 'image', options: {hotspot: true}})],
      options: {layout: 'grid'},
    }),
    defineField({
      name: 'description',
      type: 'richText',
      title: 'Description',
      description: 'Shown under the dates.',
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
