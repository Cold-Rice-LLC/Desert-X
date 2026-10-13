import {defineArrayMember, defineField, defineType} from 'sanity'
import {HeartIcon} from '@sanity/icons'

// A designed donate card: the visitor picks one-time or monthly and an
// amount here, and Donate opens the Blackbaud form at /donate/checkout
// with that choice filled in
export default defineType({
  name: 'donateModule',
  type: 'object',
  title: 'Donate',
  icon: HeartIcon,
  fields: [
    defineField({
      name: 'heading',
      type: 'string',
      title: 'Heading',
    }),
    defineField({
      name: 'image',
      type: 'image',
      title: 'Image',
      options: {hotspot: true},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      initialValue: 'Donate now',
    }),
    defineField({
      name: 'text',
      type: 'text',
      title: 'Text',
      rows: 3,
    }),
    defineField({
      name: 'amounts',
      type: 'array',
      title: 'Amounts',
      description: 'Preset amounts in dollars. Visitors can also enter their own.',
      of: [defineArrayMember({type: 'number', validation: (rule) => rule.positive().integer()})],
      initialValue: [50, 150, 250],
      validation: (rule) => rule.max(4),
    }),
  ],
  preview: {
    select: {heading: 'heading', title: 'title', media: 'image'},
    prepare: ({heading, title, media}) => ({
      title: heading || title || 'Donate',
      subtitle: 'Donate',
      media,
    }),
  },
})
