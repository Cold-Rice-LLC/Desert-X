import {defineField, defineType} from 'sanity'
import {linkTargetFields, linkTargetSelect, linkTargetSubtitle} from './linkTarget'

/** A label plus a destination: the Donate Link, menu sub-items and footer links. */
export default defineType({
  name: 'navLink',
  type: 'object',
  title: 'Link',
  fields: [
    defineField({
      name: 'label',
      type: 'string',
      title: 'Label',
      validation: (rule) => rule.required(),
    }),
    ...linkTargetFields({required: true}),
  ],
  preview: {
    select: {label: 'label', ...linkTargetSelect},
    prepare: ({label, ...link}) => ({
      title: label,
      subtitle: linkTargetSubtitle(link),
    }),
  },
})
