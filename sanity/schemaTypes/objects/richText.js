import {defineArrayMember, defineType} from 'sanity'
import {linkTargetFields} from './linkTarget'
import SmallText from './SmallText'

/**
 * Shared rich text: normal and small paragraphs, with italic and links
 * only, wherever a field takes formatted text.
 */
export default defineType({
  name: 'richText',
  type: 'array',
  title: 'Rich Text',
  of: [
    defineArrayMember({
      type: 'block',
      // Small: a closing credit, like "Generous support provided by…"
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'Small', value: 'small', component: SmallText},
      ],
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

/**
 * A short line of text with italic only, for a caption that's a link
 * itself, like a hotel's on Stay, so it can't hold links of its own.
 */
export const italicText = defineType({
  name: 'italicText',
  type: 'array',
  title: 'Italic Text',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [{title: 'Normal', value: 'normal'}],
      lists: [],
      marks: {decorators: [{title: 'Italic', value: 'em'}], annotations: []},
    }),
  ],
})

/** The plain text of a rich text value, for previews. */
export const blocksToText = (blocks = []) =>
  blocks.map((block) => (block.children || []).map((child) => child.text).join('')).join(' ')
