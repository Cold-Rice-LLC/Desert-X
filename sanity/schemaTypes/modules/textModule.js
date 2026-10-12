import {defineField, defineType} from 'sanity'
import {TextIcon} from '@sanity/icons'
import {blocksToText} from '../objects/richText'

export default defineType({
  name: 'textModule',
  type: 'object',
  title: 'Text',
  icon: TextIcon,
  fields: [
    defineField({
      name: 'heading',
      type: 'string',
      title: 'Heading',
    }),
    defineField({
      name: 'text',
      type: 'richText',
      title: 'Text',
    }),
  ],
  preview: {
    select: {heading: 'heading', text: 'text'},
    prepare: ({heading, text}) => ({
      title: heading || blocksToText(text) || 'Text',
      subtitle: 'Text',
    }),
  },
})
