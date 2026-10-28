import {defineArrayMember, defineType} from 'sanity'
import {linkTargetFields} from './linkTarget'

/**
 * Shared rich text: paragraphs with italic and links only, wherever a
 * field takes formatted text.
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
