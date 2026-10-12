import {defineField, defineType} from 'sanity'
import {linkTargetFields, linkTargetSelect, linkTargetSubtitle} from './linkTarget'

/** A label plus a destination. Used by the siteSettings footer link columns. */
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
