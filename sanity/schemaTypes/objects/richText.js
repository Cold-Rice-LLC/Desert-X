import {defineArrayMember, defineType} from 'sanity'
import {linkTargetFields} from './linkTarget'

/**
 * Shared rich text: paragraphs with italic and links only. Used by the
 * footer text and credits, the text module and schedule items.
 */
export default defineType({
  name: 'richText',
  type: 'array',
  title: 'Rich Text',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [{title: 'Normal', value: 'normal'}],
      lists: [],
      marks: {
        decorators: [{title: 'Italic', value: 'em'}],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: linkTargetFields({
              required: true,
              schemes: ['http', 'https', 'mailto', 'tel'],
            }),
          },
        ],
      },
    }),
  ],
})

/** The plain text of a rich text value, for previews. */
export const blocksToText = (blocks = []) =>
  blocks.map((block) => (block.children || []).map((child) => child.text).join('')).join(' ')
