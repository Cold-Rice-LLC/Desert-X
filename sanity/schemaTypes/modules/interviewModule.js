import {defineArrayMember, defineField, defineType} from 'sanity'
import {CommentIcon} from '@sanity/icons'
import {blocksToText} from '../objects/richText'

export default defineType({
  name: 'interviewModule',
  type: 'object',
  title: 'Interview',
  icon: CommentIcon,
  fields: [
    defineField({
      name: 'heading',
      type: 'string',
      title: 'Heading',
    }),
    defineField({
      name: 'exchanges',
      type: 'array',
      title: 'Exchanges',
      of: [
        defineArrayMember({
          name: 'exchange',
          type: 'object',
          title: 'Exchange',
          fields: [
            defineField({
              name: 'speaker',
              type: 'string',
              title: 'Speaker',
              description: 'E.g. "DX". The colon is added on the site.',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'text',
              type: 'richText',
              title: 'Text',
            }),
          ],
          preview: {
            select: {speaker: 'speaker', text: 'text'},
            prepare: ({speaker, text}) => ({
              title: [speaker && `${speaker}:`, blocksToText(text)].filter(Boolean).join(' '),
            }),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {heading: 'heading', exchanges: 'exchanges'},
    prepare: ({heading, exchanges = []}) => ({
      title: heading || 'Interview',
      subtitle: `Interview · ${exchanges.length} ${exchanges.length === 1 ? 'exchange' : 'exchanges'}`,
    }),
  },
})
