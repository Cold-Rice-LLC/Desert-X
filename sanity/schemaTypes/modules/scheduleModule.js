import {defineArrayMember, defineField, defineType} from 'sanity'
import {ClockIcon} from '@sanity/icons'
import {blocksToText} from '../objects/richText'

export default defineType({
  name: 'scheduleModule',
  type: 'object',
  title: 'Schedule',
  icon: ClockIcon,
  fields: [
    defineField({
      name: 'heading',
      type: 'string',
      title: 'Heading',
    }),
    defineField({
      name: 'items',
      type: 'array',
      title: 'Items',
      of: [
        defineArrayMember({
          name: 'scheduleItem',
          type: 'object',
          title: 'Item',
          fields: [
            defineField({
              name: 'time',
              type: 'string',
              title: 'Time',
              description: 'E.g. "10:00 AM" or "10:00 AM – 12:00 PM".',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'details',
              type: 'richText',
              title: 'Details',
            }),
          ],
          preview: {
            select: {title: 'time', details: 'details'},
            prepare: ({title, details}) => ({title, subtitle: blocksToText(details)}),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {heading: 'heading', items: 'items'},
    prepare: ({heading, items = []}) => ({
      title: heading || 'Schedule',
      subtitle: `Schedule · ${items.length} ${items.length === 1 ? 'item' : 'items'}`,
    }),
  },
})
